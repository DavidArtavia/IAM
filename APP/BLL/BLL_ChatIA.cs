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
        UTL_ManejoError manejoError =  new UTL_ManejoError();
        DTO_Respuesta respuesta = new DTO_Respuesta();

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

                // Obtener el nombre del archivo
                string fileName = Path.GetFileName(mensaje.Audio.FileName);


                // Devolver la ruta del archivo guardado
                mensaje.RutaAudio = _fileHandler.SaveFileToTempDirectory(fileData, fileName);

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
    }
}
