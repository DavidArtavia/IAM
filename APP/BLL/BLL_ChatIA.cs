using DTO;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using System.Configuration;

namespace BLL
{
    public class BLL_ChatIA
    {

        public async static Task transcribirAudio(DTO_Mensaje mensaje)
        {
            //Definimos los parametros de l allave, el idioma del audio y la región del servicio de azure
            var speechConfig = SpeechConfig.FromSubscription(ConfigurationManager.AppSettings["AzureKey"] ?? "", ConfigurationManager.AppSettings["AzureRegion"] ?? "");
            speechConfig.SpeechRecognitionLanguage = "es-ES";

            //preparamos la configuración del audio y le asigamos la ruta temporal donde se encuentra el audio que mandó el cliente
            using var audioConfig = AudioConfig.FromWavFileInput(mensaje.RutaAudio);
            using var speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);

            //aguantamos a que el servicio haga el brete de vos a texto
            var speechRecognitionResult = await speechRecognizer.RecognizeOnceAsync();
            //gestionamos la respuesta para saber si falló o lo consiguió
            OutputSpeechRecognitionResult(speechRecognitionResult);
        }


        public string obtenerRutaTemporal(byte[] fileData, string fileName) {
            // Obtener la ruta de la carpeta temporal
            string tempDirectory = Path.GetTempPath();

            // Crear la ruta completa para el archivo
            string filePath = Path.Combine(tempDirectory, fileName);

            // Guardar el archivo en la ruta temporal
            File.WriteAllBytes(filePath, fileData);

            return filePath;
        }

        public static void OutputSpeechRecognitionResult(SpeechRecognitionResult speechRecognitionResult)
        {
            switch (speechRecognitionResult.Reason)
            {
                case ResultReason.RecognizedSpeech:
                    Console.WriteLine($"RECOGNIZED: Text={speechRecognitionResult.Text}");
                    break;
                case ResultReason.NoMatch:
                    Console.WriteLine($"NOMATCH: Speech could not be recognized.");
                    break;
                case ResultReason.Canceled:
                    var cancellation = CancellationDetails.FromResult(speechRecognitionResult);
                    Console.WriteLine($"CANCELED: Reason={cancellation.Reason}");

                    if (cancellation.Reason == CancellationReason.Error)
                    {
                        Console.WriteLine($"CANCELED: ErrorCode={cancellation.ErrorCode}");
                        Console.WriteLine($"CANCELED: ErrorDetails={cancellation.ErrorDetails}");
                        Console.WriteLine($"CANCELED: Did you set the speech resource key and region values?");
                    }
                    break;
            }
        }
    }
}
