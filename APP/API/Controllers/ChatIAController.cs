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
        BLL_ChatIA chatIA = new BLL_ChatIA();

        [AllowAnonymous]
        [Produces("application/json")]
        [Route("enviarMensaje")]
        [HttpPost]
        public async Task<DTO_Respuesta> enviarMensaje([FromForm] DTO_Mensaje mensaje)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            try
            {
                //Verificamos si el cliente mandó un audio o más bien un texto escrito
                if (mensaje.Audio.Length > 0)
                {

                    //guardamos el audio de forma temporal
                    respuesta = await chatIA.guardarAudioTemp(mensaje);
                    

                    //si lo logró guardar correctamente entonces procedemos a trasncribirlo
                    if (respuesta.TipoRespuesta)
                    {
                        // reasignamos el nuevo mensaje procesado
                        mensaje = (DTO_Mensaje) respuesta.Resultado[0];
                        respuesta = await chatIA.transcribirAudio(mensaje);
                    }




                }//si no mandó audio nos ahorramos toda la lógica de guardare temporalmente, transcribir y subir a la nuve
                else
                {

                }

            }
            catch (Exception ex)
            {

            }
            return respuesta;
        }

    }


}