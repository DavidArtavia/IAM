using BLL;
using DAL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CognitiveServices.Speech.Audio;
using Microsoft.CognitiveServices.Speech;
using UTL;
using System.Text;

namespace API.Controllers
{
    [Route("api/[controller]")]
    //[ApiController] //quitamos de forma global y lo ponemos de forma independiente para que en este caso no aplique validaciones
    public class ChatIAController : Controller
    {
        private readonly UTL_FileHandler _fileHandler;

        public ChatIAController()
        {
            _fileHandler = new UTL_FileHandler();
        }

        [AllowAnonymous]
        [Produces("application/json")]
        [Route("enviarMensaje")]
        [HttpPost]
         public async Task<DTO_Respuesta> enviarMensaje([FromForm] DTO_Mensaje mensaje)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();



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
                await BLL_ChatIA.transcribirAudio(mensaje);
            }
            catch (Exception ex)
            {

            }


            return respuesta;
        }

    }
}