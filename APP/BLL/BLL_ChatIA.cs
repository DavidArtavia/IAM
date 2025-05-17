using AutoGen.AzureAIInference;
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
        private readonly UTL_FileHandler _fileHandler;
        
        UTL_ManejoError manejoError = new UTL_ManejoError();
        UTL_Cipher uTL_Cipher = new UTL_Cipher();

        DTO_Respuesta respuesta = new DTO_Respuesta();
        DTO_RepuestaIA repuestaIA = new DTO_RepuestaIA();
        DTO_Cliente cliente = new DTO_Cliente();
        DTO_ChatIA chatIA = new DTO_ChatIA();

        DAL_ChatIA dAL_chatIA = new DAL_ChatIA();
        DAL_Mensaje dAL_Mensaje = new DAL_Mensaje();
        DAL_Alerta alerta = new DAL_Alerta();

        BLL_Contexto bLL_Contexto = new BLL_Contexto();
        BLL_Cliente bLL_Cliente = new BLL_Cliente();    

        public BLL_ChatIA()
        {
            _fileHandler = new UTL_FileHandler();
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

        public async Task<DTO_Respuesta> enviarMensajeIA(DTO_Mensaje mensaje)
        {

            chatIA.ID_ChatIA = mensaje.ID_ChatIA;


            var endpoint = new Uri(ConfigurationManager.AppSettings["AzureAIServiceURL"] ?? "");
            var credential = new AzureKeyCredential(ConfigurationManager.AppSettings["AzureKey"] ?? "");
            var model = ConfigurationManager.AppSettings["AzureAIServiceModel"] ?? "";

            var client = new ChatCompletionsClient(endpoint, credential, new ChatCompletionsClientOptions());


            //Obtenemos el contexto para la IA
            respuesta = bLL_Contexto.obtenerContexto();


            //armamos contexto si obtuvo el contexto correctamente
            if (respuesta.TipoRespuesta)
            {

                var requestOptions = new ChatCompletionsOptions() { MaxTokens = 2048, Model = model };

                foreach (var contexto in (List<DTO_Contexto>)respuesta.Resultado[0])
                {
                    requestOptions.Messages.Add(new ChatRequestSystemMessage(contexto.Prompt));
                }

                //Acá unimos el contexto de la conversación si es que hay un contexto.
                respuesta = dAL_Mensaje.obtenerMensajes(chatIA);
                //si alcanzamos a obtener los mnsajes del chat correctamente

                if (respuesta.TipoRespuesta)
                {
                    int i = 0;
                    //agregamos los mensajes que el usuario agregara previamente
                    foreach (var mensajeChat in (List<DTO_Mensaje>)respuesta.Resultado[0])
                    {
                        i++;

                        switch (mensajeChat.Tipo)
                        {
                            case "system":
                                requestOptions.Messages.Add(new ChatRequestSystemMessage(mensajeChat.TextoMensaje ?? mensaje.TranscripcionAudio));
                                break;
                            case "assistant":

                                ChatRequestAssistantMessage assistant = new ChatRequestAssistantMessage();
                                assistant.Content = mensajeChat.TextoMensaje ?? mensaje.TranscripcionAudio;

                                requestOptions.Messages.Add(assistant);

                                break;
                            case "user":
                                requestOptions.Messages.Add(new ChatRequestUserMessage(mensajeChat.TextoMensaje ?? mensaje.TranscripcionAudio));
                                break;

                        }

                    }



                    Response<ChatCompletions> response = await client.CompleteAsync(requestOptions);



                    //guardar respuesta serializada
                    mensaje.TextoMensaje = new ChatRequestAssistantMessage(response.Value.Choices[0].Message).Content;
                    mensaje.Tipo = "assistant";
                    respuesta = dAL_Mensaje.guardarMensaje(mensaje);

                    //si guarda con exito
                    if (respuesta.TipoRespuesta)
                    {
                        repuestaIA = formatearRespuestaIA(mensaje);
                        if (repuestaIA.RespuestaUsuario.Length > 0)
                        {
                            mensaje.TextoMensaje = repuestaIA.RespuestaUsuario.Replace("\n", "<br>");
                            respuesta.Resultado.Add(mensaje);
                        }
                        else
                        {
                            await procesarRespuestaIA(repuestaIA);
                        }

                    }




                }
            }


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
                repuestaIA = serializer.Deserialize<DTO_RepuestaIA>(reader);
            }

            return repuestaIA;
        }

        public async Task<DTO_Respuesta> procesarRespuestaIA(DTO_RepuestaIA repuestaIA)
        {
            DTO_Mensaje mensajeUser = new DTO_Mensaje();

            //si entra acá es porque ocupa algo del sistema para continuar la converación
            if (repuestaIA.EjecutarAccionBakend)
            {
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

                        if (respuesta.TipoRespuesta)
                        {
                            respuesta = dAL_Mensaje.guardarMensaje(mensajeUser);
                        }
                        if (respuesta.TipoRespuesta)
                        {
                             respuesta = await enviarMensajeIA(mensajeUser);
                        }

                            break;

                }
            }


            return respuesta;
        }
    }
}
