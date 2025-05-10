using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using System.Configuration;

namespace BLL
{
    public class BLL_ChatIA
    {

        public async static Task Transcribir()
        {
            var speechConfig = SpeechConfig.FromSubscription(ConfigurationManager.AppSettings["AzureKey"] ?? "", ConfigurationManager.AppSettings["AzureRegion"] ?? "");
            speechConfig.SpeechRecognitionLanguage = "es-ES";

            //using var audioConfig = AudioConfig.FromWavFileInput("C:\\Users\\danny\\Downloads\\test.wav");
            //using var audioConfig = AudioConfig.FromWavFileInput("https://iamhub7185441083.blob.core.windows.net/audios/test.wav");
            using var audioConfig = AudioConfig.FromWavFileInput("https://iamhub7185441083.blob.core.windows.net/audios/test.wav?sp=r&st=2025-05-10T04:34:54Z&se=2025-05-10T12:34:54Z&sv=2024-11-04&sr=b&sig=O%2B7SlssdacL%2FTE%2FxvwJOfQFWPi5nMdShSQ3FPk%2FtcA0%3D");
            using var speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);

            Console.WriteLine("Speak into your microphone.");
            var speechRecognitionResult = await speechRecognizer.RecognizeOnceAsync();
            OutputSpeechRecognitionResult(speechRecognitionResult);
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
