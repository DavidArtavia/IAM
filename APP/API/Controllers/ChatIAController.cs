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
    //[ApiController] //quitamos de forma global y lo ponemos de forma independiente para que en este caso no aplique validaciones a las estructuras del modelo
    public class ChatIAController : Controller
    {
        BLL_ChatIA bll_chatIA = new BLL_ChatIA();
        UTL_ManejoError manejoError = new UTL_ManejoError();
        BLL_Mensaje bLL_Mensaje = new BLL_Mensaje();    

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("enviarMensaje")]
        [HttpPost]
        public async Task<DTO_Respuesta> enviarMensaje([FromForm] DTO_Mensaje mensaje)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            //PRUEBA 
            //await bll_chatIA.enviarMensajeIA(mensaje);
            try
            {
                
                //Verificamos si el cliente mandó un audio o más bien un texto escrito
                if (mensaje.Audio != null)
                {

                    //guardamos el audio de forma temporal
                    respuesta = await bll_chatIA.guardarAudioTemp(mensaje);
                    

                    //verificamos si lo logró guardar correctamente entonces procedemos a trasncribirlo
                    if (respuesta.TipoRespuesta)
                    {
                        // reasignamos el nuevo mensaje procesado
                        mensaje = (DTO_Mensaje) respuesta.Resultado[0];
                        respuesta = await bll_chatIA.transcribirAudio(mensaje);
                    }

                    //si lo logró trasncribirlo correctamente
                    if (respuesta.TipoRespuesta)
                    {
                        // reasignamos el nuevo mensaje procesado
                        mensaje = (DTO_Mensaje)respuesta.Resultado[0];

                        //Aqui la lógica para subir el archivo a la nuve y eliminarlo de la ruta temporall
                        respuesta = await bll_chatIA.guardarAudioBLOB(mensaje);
                    }


                }//si no mandó audio nos ahorramos toda la lógica de guardare temporalmente, transcribir y subir a la nuve
                else
                {

                }

            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("obtenerMensajes")]
        [HttpPost]
        public DTO_Respuesta obtenerMensajes([FromBody] DTO_ChatIA chatIA)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();

            try
            {
                respuesta = bLL_Mensaje.obtenerMensajes(chatIA);

            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }


            return respuesta;
        }        
        
        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("obtenerChats")]
        [HttpPost]
        public DTO_Respuesta obtenerChats([FromBody] DTO_Negocio negocio)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();

            try
            {
                respuesta = bll_chatIA.obtenerChats(negocio);

            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }


            return respuesta;
        }

    }


}