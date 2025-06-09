using BLL;
using DAL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CognitiveServices.Speech.Audio;
using Microsoft.CognitiveServices.Speech;
using UTL;
using System.Text;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    //[ApiController] //quitamos de forma global y lo ponemos de forma independiente para que en este caso no aplique validaciones a las estructuras del modelo
    public class ChatIAController : Controller
    {
        private readonly BLL_ChatIA _bll_chatIA;

        public ChatIAController(BLL_ChatIA bll_chatIA)
        {
            _bll_chatIA = bll_chatIA;
        }

        
        UTL_ManejoError manejoError = new UTL_ManejoError();
        BLL_Mensaje bLL_Mensaje = new BLL_Mensaje();


        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("pruebaSignalR")]
        [HttpPost]
        public DTO_Respuesta pruebaSignalR()
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            DTO_Usuario usuario = new DTO_Usuario();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var userEmailClaim = User.FindFirst(ClaimTypes.Email);
            if (userIdClaim == null) throw new UnauthorizedAccessException("User ID claim is missing.");
            usuario.ID_Usuario = Convert.ToInt32(userIdClaim.Value);
            if (userEmailClaim == null) throw new UnauthorizedAccessException("User Email claim is missing.");
            usuario.CorreoUsuario = userEmailClaim.Value;

            _bll_chatIA.notificar(usuario);
            return new DTO_Respuesta();
        }

            [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("enviarMensaje")]
        [HttpPost]
        public async Task<DTO_Respuesta> enviarMensaje([FromForm] DTO_Mensaje mensaje)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            DTO_Usuario usuario = new DTO_Usuario();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var userEmailClaim = User.FindFirst(ClaimTypes.Email);
            if (userIdClaim == null) throw new UnauthorizedAccessException("User ID claim is missing.");
            usuario.ID_Usuario = Convert.ToInt32(userIdClaim.Value);
            if (userEmailClaim == null) throw new UnauthorizedAccessException("User Email claim is missing.");
            usuario.CorreoUsuario = userEmailClaim.Value;

            mensaje.Envia = "USUARIO";
            mensaje.Recibe = "IAM";

            try
            {
                
                //Verificamos si el cliente mandó un audio o más bien un texto escrito
                if (mensaje.Audio != null)
                {

                    //guardamos el audio de forma temporal
                    respuesta = await _bll_chatIA.guardarAudioTemp(mensaje);
                    

                    //verificamos si lo logró guardar correctamente entonces procedemos a trasncribirlo
                    if (respuesta.TipoRespuesta)
                    {
                        // reasignamos el nuevo mensaje procesado
                        mensaje = (DTO_Mensaje) respuesta.Resultado[0];
                        respuesta = await _bll_chatIA.transcribirAudio(mensaje);
                    }

                    //si lo logró trasncribirlo correctamente
                    if (respuesta.TipoRespuesta)
                    {
                        // reasignamos el nuevo mensaje procesado
                        mensaje = (DTO_Mensaje)respuesta.Resultado[0];

                        //Aqui la lógica para subir el archivo a la nuve y eliminarlo de la ruta temporall
                        respuesta = await _bll_chatIA.guardarAudioBLOB(mensaje);
                    }

                }
            
                   respuesta = await _bll_chatIA.gestionarConversacionIA(mensaje, usuario);
            

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
                
                respuesta.Resultado.Add(_bll_chatIA.formatearMensajesParaChat((List<DTO_Mensaje>)bLL_Mensaje.obtenerMensajes(chatIA).Resultado[0]));

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
                respuesta = _bll_chatIA.obtenerChats(negocio);

            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }


            return respuesta;
        }

    }


}