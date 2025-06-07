
using Azure;
using Azure.AI.Inference;
using Azure.Core.Pipeline;
using DAL;
using DTO;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using Newtonsoft.Json;
using System.Configuration;
using System.Text.RegularExpressions;
using UTL;
using JsonSerializer = Newtonsoft.Json.JsonSerializer;

namespace BLL
{
    public class BLL_ChatIA
    {
        //Globales
        public ChatCompletionsClient client;
        public ChatCompletionsOptions requestOptions;
        List<DTO_Contexto> contextos = new();
        List<DTO_Mensaje> mensajes = new();


        private readonly UTL_FileHandler _fileHandler;

        private UTL_ManejoError manejoError = new();
        UTL_Cipher uTL_Cipher = new();

        DTO_Respuesta respuesta = new();
        DTO_ChatIA chatIA = new();

        DAL_ChatIA dAL_chatIA = new();
        DAL_Alerta alerta = new();

        BLL_Contexto bLL_Contexto = new();
        BLL_Cliente bLL_Cliente = new();
        BLL_OrdenServicio bLL_OrdenServicio = new();
        BLL_Mensaje bLL_Mensaje = new();

        public BLL_ChatIA()
        {

            ChatCompletionsClientOptions options = new ChatCompletionsClientOptions(ChatCompletionsClientOptions.ServiceVersion.V2024_05_01_Preview);
            options.RetryPolicy = new RetryPolicy(2);

            _fileHandler = new UTL_FileHandler();
            client = new ChatCompletionsClient(new Uri(ConfigurationManager.AppSettings["AzureAIServiceURL"] ?? ""), new AzureKeyCredential(ConfigurationManager.AppSettings["AzureKey"] ?? ""), options);
            requestOptions = new ChatCompletionsOptions()
            {
                MaxTokens = Convert.ToInt32(ConfigurationManager.AppSettings["AzureMaxTokens"] ?? "3000"),
                Model = ConfigurationManager.AppSettings["AzureAIServiceModel"] ?? "",
                Temperature = (float) 0.5
                
            };
        }

        public async Task<DTO_Respuesta> guardarAudioTemp(DTO_Mensaje mensaje)
        {
            try
            {
                // Leer el archivo como byte[]
                byte[] fileData;
                using (var memoryStream = new MemoryStream())
                {
                    await mensaje.Audio.CopyToAsync(memoryStream);
                    fileData = memoryStream.ToArray();  // Obtener los bytes del archivo
                }



                // Devolver la ruta del archivo guardado
                mensaje.RutaAudio = _fileHandler.SaveFileToTempDirectory(fileData, uTL_Cipher.generarCodigoFecha() + ".WAV");

                respuesta = alerta.obtenerAlerta("A008");

                respuesta.Resultado.Add(mensaje);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }

        public async Task<DTO_Respuesta> transcribirAudio(DTO_Mensaje mensaje)
        {
            //Definimos los parametros de l allave, el idioma del audio y la región del servicio de azure
            var speechConfig = SpeechConfig.FromSubscription(ConfigurationManager.AppSettings["AzureKey"] ?? "", ConfigurationManager.AppSettings["AzureRegion"] ?? "");
            speechConfig.SpeechRecognitionLanguage = "es-ES";

            //preparamos la configuración del audio y le asigamos la ruta temporal donde se encuentra el audio que mandó el cliente
            using var audioConfig = AudioConfig.FromWavFileInput(mensaje.RutaAudio);
            using var speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);

            //aguantamos a que el servicio haga el brete de vos a texto
            var speechRecognitionResult = await speechRecognizer.RecognizeOnceAsync();


            //gestionamos la respuesta para saber si falló o lo consiguió y devolvemos el resultado
            return gestionarResultadoTranscripcion(speechRecognitionResult, mensaje);


        }

        public DTO_Respuesta gestionarResultadoTranscripcion(SpeechRecognitionResult speechRecognitionResult, DTO_Mensaje mensaje)
        {
            switch (speechRecognitionResult.Reason)
            {
                case ResultReason.RecognizedSpeech:
                    respuesta = alerta.obtenerAlerta("A009");
                    mensaje.Contenido = speechRecognitionResult.Text;
                    respuesta.Resultado.Add(mensaje);
                    break;
                case ResultReason.NoMatch:
                    respuesta = alerta.obtenerAlerta("A0010");
                    break;
                case ResultReason.Canceled:
                    var cancellation = CancellationDetails.FromResult(speechRecognitionResult);
                    respuesta = alerta.obtenerAlerta("A0011");
                    respuesta.Resultado.Add(cancellation);
                    break;
            }
            return respuesta;
        }

        public async Task<DTO_Respuesta> guardarAudioBLOB(DTO_Mensaje mensaje)
        {
            try
            {
                var client = new HttpClient();
                String url = ConfigurationManager.AppSettings["AzureBlobURL"] + "/"
                            + ConfigurationManager.AppSettings["AzureBlobContainer"] + "/" +
                            uTL_Cipher.generarCodigoFecha() + ".WAV" +
                            ConfigurationManager.AppSettings["AzureBlobSV"];
                var request = new HttpRequestMessage(HttpMethod.Put, url);
                request.Headers.Add("x-ms-blob-type", "BlockBlob");
                request.Content = new StreamContent(File.OpenRead(mensaje.RutaAudio));
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                if (response.IsSuccessStatusCode)
                {
                    request.Dispose();
                    respuesta = alerta.obtenerAlerta("A0012");
                    //Eliminamos el audio de la carpeta temporal
                    _fileHandler.DeleteFileInToTempDirectory(mensaje.RutaAudio);
                    mensaje.RutaAudio = url;
                    respuesta.Resultado.Add(mensaje);

                }
                else
                {
                    respuesta = alerta.obtenerAlerta("A0013");
                }
            }
            catch (Exception ex)
            {

                manejoError.errorNoControlado(ex);
            }

            return respuesta;

        }

        public DTO_Respuesta obtenerChats(DTO_Negocio negocio)
        {
            return dAL_chatIA.obtenerChats(negocio);
        }

        public async Task<DTO_Respuesta> cargarContexto(DTO_Usuario usuario)
        {
            DTO_Respuesta respContexto = new();
            //Obtenemos el contexto para la IA
            if (contextos.Count() == 0)
            {
                respContexto = await bLL_Contexto.obtenerContexto(usuario, chatIA);

                contextos = (List<DTO_Contexto>) respContexto.Resultado[0];


                foreach (var contexto in contextos)
                {
                    requestOptions.Messages.Add(new ChatRequestSystemMessage(contexto.Prompt));
                }

                //Acá unimos el contexto de la conversación si es que hay un contexto.
                if (mensajes.Count() == 0)
                {
                    mensajes = (List<DTO_Mensaje>)bLL_Mensaje.obtenerMensajes(chatIA).Resultado[0];
                }

                //agregamos los mensajes que el usuario agregara previamente
                foreach (var mensajeChat in mensajes)
                {
                    agregarMensajeAlContexto(mensajeChat);
                }
            }
            return respContexto;

        }

        public void agregarMensajeAlContexto(DTO_Mensaje mensaje)
        {
            ChatRequestAssistantMessage assistant = new ChatRequestAssistantMessage();
            assistant.Content = Newtonsoft.Json.JsonConvert.SerializeObject(mensaje);

            switch (mensaje.Envia)
            {

                case "BAKEND":

                    requestOptions.Messages.Add(assistant);

                    break;
                case "IAM":

                    requestOptions.Messages.Add(assistant);

                    break;
                case "USUARIO":

                    requestOptions.Messages.Add(new ChatRequestUserMessage(JsonConvert.SerializeObject(mensaje)));

                    break;

            }

        }

        public async Task<DTO_Respuesta> gestionarConversacionIA(DTO_Mensaje mensaje, DTO_Usuario usuario)
        {
            DTO_Respuesta resp = new DTO_Respuesta();
            DTO_Mensaje msjRespIA = new();
            chatIA.ID_ChatIA = mensaje.ID_ChatIA;

            //cargamos el contexto inicial
            await cargarContexto(usuario);



            msjRespIA = await enviarMensajeIA(mensaje);


            int contadorIteraciones = 0;

            while (msjRespIA.Recibe != "USUARIO" && contadorIteraciones < 5)
            {
                contadorIteraciones++;

                if (msjRespIA.Recibe == "BAKEND")
                {
                    mensaje = await ejecutarAccionBakend(msjRespIA, usuario);
                    msjRespIA = await enviarMensajeIA(mensaje);
                }

            }


            resp.TipoRespuesta = true;
            resp.Resultado.Add(msjRespIA);

            return resp;

        }

        public async Task<DTO_Mensaje> enviarMensajeIA(DTO_Mensaje mensaje)
        {
            DTO_Mensaje msjRespIA = new();

            //cargamos el mensaje al contexto
            agregarMensajeAlContexto(mensaje);

            
            


            //Reintentos
            bool respuestCorecta = false;
            int contadorIntentos = 0;
            while (!respuestCorecta || contadorIntentos == 3)
            {
                contadorIntentos++;
                //Creamos la respuesta
                Response<ChatCompletions> response = await client.CompleteAsync(requestOptions);

                if (new ChatRequestAssistantMessage(response.Value.Choices[0].Message).Content != null)
                {
                    respuestCorecta = true;

                    //Ejecutamos el procesamiento con IA
                    msjRespIA = formatearRespuestaIA(new ChatRequestAssistantMessage(response.Value.Choices[0].Message).Content);
                }

            }

            if (respuestCorecta == false && contadorIntentos == 3)
            {
                //loguear el error
                throw new Exception("Error de interpetación IAM");
            }

            //guardamos la respuesta serializada
            bLL_Mensaje.guardarMensaje(mensaje);


            //guardamos la respuesta serializada
            bLL_Mensaje.guardarMensaje(msjRespIA);
            

            //Si está vacío quiere decir que el procesamiento continuará por lo que procedemos a meter el mensaje al contexto
            if (msjRespIA.Recibe != "USUARIO")
            {
                agregarMensajeAlContexto(msjRespIA);
            }

            return msjRespIA;

        }
        public List<DTO_Mensaje> formatearMensajesParaChat(List<DTO_Mensaje> mensajesObtenidos)
        {
            List<DTO_Mensaje> mensajesProcesados = new();
            DTO_MensajeIA respIA = new();

            foreach (DTO_Mensaje msj in mensajesObtenidos)
            {
                if (msj.Recibe != "BAKEND" && msj.Envia != "BAKEND")
                {

                    mensajesProcesados.Add(msj);

                }

            }

            return mensajesProcesados;
        }
        public DTO_Mensaje formatearRespuestaIA(string content)
        {
            DTO_Mensaje respuestaIAFormateada = new DTO_Mensaje();

            // 1) Intentamos extraer JSON encerrado en ```json ... ```
            string rawJson = null;
            // var match = Regex.Match(content, @"```json\s*(\{[\s\S]*?\})\s*```", RegexOptions.IgnoreCase);
            var match = Regex.Match(content, @"\|\|(.*?)\|\|", RegexOptions.Singleline);
            if (match.Success)
            {
                rawJson = match.Groups[1].Value;
            }
            else
            {
                // 2) Si no lo encontramos, buscamos la primera '{' y la última '}'
                int indicePrimeraLlave = content.IndexOf('{');
                if (indicePrimeraLlave >= 0)
                {
                    int indiceUltimaLlave = content.LastIndexOf('}');
                    if (indiceUltimaLlave >= indicePrimeraLlave)
                        rawJson = content.Substring(indicePrimeraLlave, indiceUltimaLlave - indicePrimeraLlave + 1);
                    else
                        rawJson = content.Substring(indicePrimeraLlave);
                }
            }

            // 3) Si obtuvimos algo que parece JSON, intentamos deserializarlo
            if (!string.IsNullOrWhiteSpace(rawJson))
            {
                try
                {
                    JsonSerializer serializer = new JsonSerializer();
                    using (StringReader sr = new StringReader(rawJson))
                    using (JsonTextReader reader = new JsonTextReader(sr))
                    {
                        respuestaIAFormateada = serializer.Deserialize<DTO_Mensaje>(reader) ?? new DTO_Mensaje();
                    }
                }
                catch (JsonReaderException)
                {
                    //Si no es válido
                    if (!respuesta.TipoRespuesta)
                        throw new Exception("Json no válido");
                }
            }

            // 4) Asignamos el ID_ChatIA antes de retornar
            respuestaIAFormateada.ID_ChatIA = chatIA.ID_ChatIA;
            return respuestaIAFormateada;
        }



        public async Task<DTO_Mensaje> ejecutarAccionBakend(DTO_Mensaje repuestaIA, DTO_Usuario usuario)
        {
            DTO_Mensaje mensajeParaIAM = new();
            DTO_Cliente cliente = new();
            DTO_OrdenServicio ordenServicio = new();

            mensajeParaIAM.Recibe = "IAM";
            mensajeParaIAM.Envia = "BAKEND";
            mensajeParaIAM.Parametros = repuestaIA.Parametros;
            mensajeParaIAM.ID_ChatIA = chatIA.ID_ChatIA;

            switch (repuestaIA.Contenido.ToString())
            {
                case "buscarCliente":
                    
                    cliente.NombreCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("NombreCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.ApellidoCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("ApellidoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.TelefonoCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("TelefonoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.CorreoCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("CorreoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.ID_Usuario = usuario.ID_Usuario;
                    
                    mensajeParaIAM.Contenido = JsonConvert.SerializeObject(await bLL_Cliente.buscarCliente(cliente));


                    break;
                case "guardarCliente":

                    cliente.NombreCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("NombreCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.ApellidoCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("ApellidoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.TelefonoCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("TelefonoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.CorreoCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("CorreoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;

                    mensajeParaIAM.Contenido = JsonConvert.SerializeObject(await bLL_Cliente.guardarCliente(usuario, cliente));

                    break;

                case "guardarOrdenServicio":

                    ordenServicio.Estado.ID_Estado = Convert.ToInt32(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ID_Estado", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");
                    ordenServicio.ReferenciaJSON = JsonConvert.DeserializeObject<List<DTO_Param>>(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ReferenciaJSON", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty) ?? [];
                    ordenServicio.NotaOrdenServicio = repuestaIA.Parametros.Find(p => p.Nombre.Equals("NotaOrdenServicio", StringComparison.OrdinalIgnoreCase))?.Valor ?? "";
                    ordenServicio.ID_Negocio = Convert.ToInt32(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ID_Negocio", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");
                    ordenServicio.FechaEstimadaEntrega = Convert.ToDateTime(repuestaIA.Parametros.Find(p => p.Nombre.Equals("FechaEstimadaEntrega", StringComparison.OrdinalIgnoreCase))?.Valor ?? "");
                    ordenServicio.ID_Cliente = Convert.ToInt32(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ID_Cliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");

                    mensajeParaIAM.Contenido = JsonConvert.SerializeObject(await bLL_OrdenServicio.registrarOrdenServicio(ordenServicio));

                    break;                
                
                case "buscarOrdenServicio":

                    ordenServicio.ID_OrdenServicio = Convert.ToInt32(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ID_OrdenServicio", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");
                    ordenServicio.ID_Negocio = Convert.ToInt32(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ID_Negocio", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");
                    ordenServicio.ReferenciaJSON = JsonConvert.DeserializeObject<List<DTO_Param>>(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ReferenciaJSON", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty) ?? [];
                    cliente.NombreCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("NombreCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.ApellidoCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("ApellidoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.TelefonoCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("TelefonoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.CorreoCliente = repuestaIA.Parametros.Find(p => p.Nombre.Equals("CorreoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;

                    mensajeParaIAM.Contenido = JsonConvert.SerializeObject(await bLL_OrdenServicio.buscarOrdenServicio(ordenServicio, cliente));

                    break;                
                case "actualizarOrdenServicio":

                    ordenServicio.ID_OrdenServicio = Convert.ToInt32(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ID_OrdenServicio", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");
                    ordenServicio.ReferenciaJSON = JsonConvert.DeserializeObject<List<DTO_Param>>(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ReferenciaJSON", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty) ?? [];
                    ordenServicio.NotaOrdenServicio = repuestaIA.Parametros.Find(p => p.Nombre.Equals("NotaOrdenServicio", StringComparison.OrdinalIgnoreCase))?.Valor ?? "";
                    ordenServicio.ID_Negocio = Convert.ToInt32(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ID_Negocio", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");
                    ordenServicio.FechaEstimadaEntrega = DateTime.TryParse(repuestaIA.Parametros.Find(p => p.Nombre.Equals("FechaEstimadaEntrega", StringComparison.OrdinalIgnoreCase))?.Valor, out var FechaEstimadaEntrega) ? FechaEstimadaEntrega : (DateTime?)null;
                    ordenServicio.FechaInicio = DateTime.TryParse(repuestaIA.Parametros.Find(p => p.Nombre.Equals("FechaInicio", StringComparison.OrdinalIgnoreCase))?.Valor, out var FechaInicio) ? FechaInicio : (DateTime?)null;
                    ordenServicio.FechaFinal = DateTime.TryParse(repuestaIA.Parametros.Find(p => p.Nombre.Equals("FechaFinal", StringComparison.OrdinalIgnoreCase))?.Valor, out var FechaFinal) ? FechaFinal : (DateTime?)null;
                    ordenServicio.FechaEntrega = DateTime.TryParse(repuestaIA.Parametros.Find(p => p.Nombre.Equals("FechaEntrega", StringComparison.OrdinalIgnoreCase))?.Valor, out var FechaEntrega) ? FechaEntrega : (DateTime?)null;
                    ordenServicio.Estado = JsonConvert.DeserializeObject<DTO_Estado>(repuestaIA.Parametros.Find(p => p.Nombre.Equals("Estado", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty) ?? new DTO_Estado();
                    ordenServicio.ID_Cliente = Convert.ToInt32(repuestaIA.Parametros.Find(p => p.Nombre.Equals("ID_Cliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");

                    mensajeParaIAM.Contenido = JsonConvert.SerializeObject(await bLL_OrdenServicio.actualizarOrdenServicio(ordenServicio));

                    break;

            }

            return mensajeParaIAM;

        }

    }
}
