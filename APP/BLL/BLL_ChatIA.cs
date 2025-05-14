using AutoGen.AzureAIInference;
using Azure;
using Azure.AI.Inference;
using DAL;
using DTO;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using System.Configuration;
using UTL;

namespace BLL
{
    public class BLL_ChatIA
    {
        private readonly UTL_FileHandler _fileHandler;
        DAL_Alerta alerta = new DAL_Alerta();
        UTL_ManejoError manejoError = new UTL_ManejoError();
        DTO_Respuesta respuesta = new DTO_Respuesta();
        UTL_Cipher uTL_Cipher = new UTL_Cipher();
        DAL_ChatIA chatIA = new DAL_ChatIA();


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

        public async Task<DTO_Respuesta> enviarMensajeIA(DTO_Mensaje mensaje)
        {
            try
            {


                var endpoint = new Uri(ConfigurationManager.AppSettings["AzureAIServiceURL"] ?? "");
                var credential = new AzureKeyCredential(ConfigurationManager.AppSettings["AzureKey"] ?? "");
                var model = ConfigurationManager.AppSettings["AzureAIServiceModel"] ?? "";

                var client = new ChatCompletionsClient(
                    endpoint,
                    credential,
                    new ChatCompletionsClientOptions()
                );

                // Create an initial request to the chatbot.
                var requestOptions = new ChatCompletionsOptions()
                {
                    Messages =
                    {
                        //new ChatRequestSystemMessage("Usted es un asistente para preparar cafés en pocos pasos, debe contestar en máximo 5 pasos y todas las respuestas deben ser en español"),
                        new ChatRequestUserMessage("Hola como puedo hacer un café?")
                    
                    },
                    MaxTokens = 2048,
                    Model = model

                };
                Response<ChatCompletions> response = client.Complete(requestOptions);
                //System.Console.WriteLine(response.Value);
                // Append the model response to the chat history.
                //requestOptions.Messages.Add(new ChatRequestAssistantMessage(response.Value.Content));
                // Append new user question.
               // requestOptions.Messages.Add(new ChatRequestUserMessage("What is so great about #1?"));

                //response = client.Complete(requestOptions);
                // System.Console.WriteLine(response.Value.Content);
            }
            catch (Exception ex)
            {

                manejoError.errorNoControlado(ex);
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
            return chatIA.obtenerChats(negocio);
        }


    }
}
