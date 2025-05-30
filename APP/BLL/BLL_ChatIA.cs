using AutoGen.AzureAIInference;
using AutoGen.Core;
using Azure;
using Azure.AI.Inference;
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
        public ChatCompletionsClient? client;
        public ChatCompletionsOptions? requestOptions;
        List<DTO_Contexto> contextos = new();
        List<DTO_Mensaje> mensajes = new();


        private readonly UTL_FileHandler _fileHandler;

        private UTL_ManejoError manejoError = new();
        UTL_Cipher uTL_Cipher = new();

        DTO_Respuesta respuesta = new();
        DTO_RepuestaIA repuestaIA = new();
        DTO_Cliente cliente = new();
        DTO_ChatIA chatIA = new();
        DTO_OrdenServicio ordenServicio = new();

        DAL_ChatIA dAL_chatIA = new();
        DAL_Alerta alerta = new();

        BLL_Contexto bLL_Contexto = new();
        BLL_Cliente bLL_Cliente = new();
        BLL_OrdenServicio bLL_OrdenServicio = new();
        BLL_Mensaje bLL_Mensaje = new();

        public BLL_ChatIA()
        {
            _fileHandler = new UTL_FileHandler();
            client = new ChatCompletionsClient(new Uri(ConfigurationManager.AppSettings["AzureAIServiceURL"] ?? ""), new AzureKeyCredential(ConfigurationManager.AppSettings["AzureKey"] ?? ""), new ChatCompletionsClientOptions());
            requestOptions = new ChatCompletionsOptions() { MaxTokens = Convert.ToInt32(ConfigurationManager.AppSettings["AzureMaxTokens"] ?? "2048"), Model = ConfigurationManager.AppSettings["AzureAIServiceModel"] ?? "" };


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
                    mensaje.TranscripcionAudio = speechRecognitionResult.Text;
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

        public void cargarContexto(DTO_Mensaje mensaje, DTO_Usuario usuario)
        {
            //Obtenemos el contexto para la IA
            if (contextos.Count() == 0)
            {
                contextos = (List<DTO_Contexto>)bLL_Contexto.obtenerContexto(usuario, chatIA).Resultado[0];


                foreach (var contexto in contextos)
                {
                    requestOptions.Messages.Add(new ChatRequestSystemMessage(contexto.Prompt));
                }

                //Acá unimos el contexto de la conversación si es que hay un contexto.
                if (mensajes.Count() == 0)
                {
                    respuesta = bLL_Mensaje.obtenerMensajes(chatIA);
                    mensajes = (List<DTO_Mensaje>)respuesta.Resultado[0];
                }

                //agregamos los mensajes que el usuario agregara previamente
                foreach (var mensajeChat in mensajes)
                {
                    agregarMensajeAlContexto(mensajeChat);
                }
            }

        }

        public void agregarMensajeAlContexto(DTO_Mensaje mensaje)
        {

            switch (mensaje.Tipo)
            {
                case "system":
                    requestOptions.Messages.Add(new ChatRequestSystemMessage(mensaje.TextoMensaje ?? mensaje.TranscripcionAudio));
                    break;
                case "assistant":

                    ChatRequestAssistantMessage assistant = new ChatRequestAssistantMessage();
                    assistant.Content = mensaje.TextoMensaje ?? mensaje.TranscripcionAudio;

                    requestOptions.Messages.Add(assistant);

                    break;
                case "user":
                    requestOptions.Messages.Add(new ChatRequestUserMessage(mensaje.TextoMensaje ?? mensaje.TranscripcionAudio));
                    break;

            }

        }
        public DTO_Respuesta enviarMensajeIA(DTO_Mensaje mensaje, DTO_Usuario usuario)
        {

            chatIA.ID_ChatIA = mensaje.ID_ChatIA;

            //cargamos el contexto
            cargarContexto(mensaje, usuario);

            //cargamos el mensaje al contexto
            agregarMensajeAlContexto(mensaje);

            //guardamos el mensaje en DB
            bLL_Mensaje.guardarMensaje(mensaje);

            //Creamos la respuesta
            Response<ChatCompletions> response = client.Complete(requestOptions);

            //guardamos la respuesta serializada
            mensaje.TextoMensaje = new ChatRequestAssistantMessage(response.Value.Choices[0].Message).Content;
            mensaje.Tipo = "assistant";
            bLL_Mensaje.guardarMensaje(mensaje);

            //damos forma a la respuesta
            repuestaIA = formatearRespuestaIA(mensaje);


            if (repuestaIA.RespuestaUsuario.Length > 0)
            {
                mensaje.TextoMensaje = repuestaIA.RespuestaUsuario.Replace("\n", "<br>");
                respuesta.Resultado.Clear();
                respuesta.Resultado.Add(mensaje);
            }
            else
            {
                procesarRespuestaIA(repuestaIA, usuario);
            }

            return respuesta;

        }
        public DTO_Respuesta formatearMensajesParaChat(List<DTO_Mensaje> mensajesObtenidos)
        {
            List<DTO_Mensaje> mensajesProcesados = new List<DTO_Mensaje>();
            DTO_RepuestaIA respIA = new();


            foreach (DTO_Mensaje msj in mensajesObtenidos)
            {
                switch (msj.Tipo)
                {
                    case "user":
                        mensajesProcesados.Add(msj);
                        break;
                    case "assistant":
                        respIA = formatearRespuestaIA(msj);
                        if (respIA.RespuestaUsuario.Length > 0)
                        {
                            msj.TextoMensaje = respIA.RespuestaUsuario;
                            mensajesProcesados.Add(msj);
                        }
                        break;
                }
            }

            respuesta.Resultado.Clear();
            respuesta.TipoRespuesta = true;
            respuesta.Resultado.Add(mensajesProcesados);

            return respuesta;
        }
        public DTO_RepuestaIA formatearRespuestaIA(DTO_Mensaje mensajeIA)
        {
            DTO_Mensaje mensajeUser = new DTO_Mensaje();
            DTO_RepuestaIA repuestaIA = new DTO_RepuestaIA();

            //Quitamos el razonamiento
            mensajeUser.TextoMensaje = Regex.Replace(mensajeIA.TextoMensaje, @"<think>.*?</think>", String.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            //Nos quedamos solo con la parte JSON
            int indiceLlave = mensajeUser.TextoMensaje.IndexOf('{');
            if (indiceLlave == -1) throw new FormatException("No se encontró JSON en la cadena.");


            //Deserializamos

            JsonSerializer serializer = new JsonSerializer();
            using (StringReader sr = new StringReader(mensajeUser.TextoMensaje.Substring(indiceLlave)))
            using (JsonTextReader reader = new JsonTextReader(sr))
            {
                repuestaIA = serializer.Deserialize<DTO_RepuestaIA>(reader) ?? new();
            }

            return repuestaIA;
        }

        public void procesarRespuestaIA(DTO_RepuestaIA repuestaIA, DTO_Usuario usuario)
        {

            //si entra acá es porque ocupa algo del sistema para continuar la converación
            if (repuestaIA.EjecutarAccionBakend)
            {
                ejecutarAccionBakend(repuestaIA, usuario);
            }
            else if (repuestaIA.EjecutarIntencionDetectada)
            {
                ejecutarIntencionDetectada(repuestaIA, usuario);
            }

        }

        public void ejecutarAccionBakend(DTO_RepuestaIA repuestaIA, DTO_Usuario usuario)
        {
            DTO_Mensaje mensajeUser = new();

            switch (repuestaIA.AccionBakendDetectada)
            {
                case "buscarCliente":

                    cliente.NombreCliente = repuestaIA.ParamsAccion.Find(p => p.Nombre.Equals("NombreCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.ApellidoCliente = repuestaIA.ParamsAccion.Find(p => p.Nombre.Equals("ApellidoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.TelefonoCliente = repuestaIA.ParamsAccion.Find(p => p.Nombre.Equals("TelefonoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.CorreoCliente = repuestaIA.ParamsAccion.Find(p => p.Nombre.Equals("CorreoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;


                    respuesta = bLL_Cliente.buscarCliente(cliente);

                    mensajeUser.TextoMensaje = JsonConvert.SerializeObject(respuesta);
                    mensajeUser.Tipo = "assistant";
                    mensajeUser.ID_ChatIA = chatIA.ID_ChatIA;

                    mensajes.Add(mensajeUser);
                    enviarMensajeIA(mensajeUser, usuario);

                    break;

            }

        }

        public void ejecutarIntencionDetectada(DTO_RepuestaIA repuestaIA, DTO_Usuario usuario)
        {
            DTO_Mensaje mensajeUser = new DTO_Mensaje();

            switch (repuestaIA.IntencionDetectada)
            {
                case "guardarCliente":

                    cliente.NombreCliente = repuestaIA.ParamsIntencion.Find(p => p.Nombre.Equals("NombreCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.ApellidoCliente = repuestaIA.ParamsIntencion.Find(p => p.Nombre.Equals("ApellidoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.TelefonoCliente = repuestaIA.ParamsIntencion.Find(p => p.Nombre.Equals("TelefonoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;
                    cliente.CorreoCliente = repuestaIA.ParamsIntencion.Find(p => p.Nombre.Equals("CorreoCliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty;


                    respuesta = bLL_Cliente.guardarCliente(usuario, cliente);

                    mensajeUser.TextoMensaje = JsonConvert.SerializeObject(respuesta);
                    mensajeUser.Tipo = "assistant";
                    mensajeUser.ID_ChatIA = chatIA.ID_ChatIA;

                    mensajes.Add(mensajeUser);
                    enviarMensajeIA(mensajeUser, usuario);


                    break;

                case "guardarOrdenServicio":

                    ordenServicio.Estado.ID_Estado = Convert.ToInt32(repuestaIA.ParamsIntencion.Find(p => p.Nombre.Equals("ID_Estado", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");
                    ordenServicio.ReferenciaJSON = JsonConvert.DeserializeObject<List<DTO_Param>>(repuestaIA.ParamsIntencion.Find(p => p.Nombre.Equals("ReferenciaJSON", StringComparison.OrdinalIgnoreCase))?.Valor ?? string.Empty) ?? [];
                    ordenServicio.NotaOrdenServicio = repuestaIA.ParamsIntencion.Find(p => p.Nombre.Equals("NotaOrdenServicio", StringComparison.OrdinalIgnoreCase))?.Valor ?? "";
                    ordenServicio.ID_Negocio = Convert.ToInt32(repuestaIA.ParamsIntencion.Find(p => p.Nombre.Equals("ID_Negocio", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");
                    ordenServicio.FechaEstimadaEntrega = Convert.ToDateTime(repuestaIA.ParamsIntencion.Find(p => p.Nombre.Equals("FechaEstimadaEntrega", StringComparison.OrdinalIgnoreCase))?.Valor ?? "");
                    ordenServicio.ID_Cliente = Convert.ToInt32(repuestaIA.ParamsIntencion.Find(p => p.Nombre.Equals("ID_Cliente", StringComparison.OrdinalIgnoreCase))?.Valor ?? "0");

                    respuesta = bLL_OrdenServicio.registrarOrdenServicio(ordenServicio);

                    mensajeUser.TextoMensaje = JsonConvert.SerializeObject(respuesta);
                    mensajeUser.Tipo = "assistant";
                    mensajeUser.ID_ChatIA = chatIA.ID_ChatIA;

                    mensajes.Add(mensajeUser);
                    enviarMensajeIA(mensajeUser, usuario);

                    break;

            }

        }
    }
}
