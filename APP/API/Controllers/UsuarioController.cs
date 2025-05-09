using BLL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UTL;


namespace API.Controllers
{
   
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        DTO_Respuesta respuesta = new DTO_Respuesta();

        [AllowAnonymous]
        [Produces("application/json")]
        [Route("registrarUsuario")]
        [HttpPost]
        public DTO_Respuesta registrarUsuario([FromBody] DTO_Usuario usuario)
        {
                
            try
            {
                BLL_Usuario bLL_Usuario = new BLL_Usuario();
                respuesta = bLL_Usuario.registrarUsuario(usuario);
            }
            catch (Exception ex) 
            {
                respuesta.Codigo = ex.HResult.ToString();
                respuesta.TipoRespuesta = false;
                respuesta.Mensaje = ex.Message;
            }

            return respuesta;
        }
   

        [AllowAnonymous]
        [Produces("application/json")]
        [Route("autenticarUsuario")]
        [HttpPost]
        public DTO_Respuesta autenticarUsuario([FromBody] DTO_Usuario usuario)
        {
            UTL_Cipher uTL_Cipher = new UTL_Cipher();
            DTO.DTO_Sesion sesion = new DTO_Sesion();

            
                
            try
            {
                //Validamos la cuestión
                BLL_Usuario bLL_Usuario = new BLL_Usuario();
                respuesta = bLL_Usuario.autenticarUsuario(usuario);

                //Si autentica correctamente procedemos
                if (respuesta.TipoRespuesta)
                {

                    //Creamos el accesToken
                    String accesToken = uTL_Cipher.generarAccessToken((DTO_Usuario)respuesta.Resultado[0]);
                    sesion.RefreshToken = Guid.NewGuid().ToString();
                    sesion.ID_Usuario = usuario.ID_Usuario;
                    respuesta.Resultado.Add(sesion);
                    //Guardar el refreshToken


                    //Agregamos el refreshToken a una Cookie HttpOnly
                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTime.UtcNow.AddDays(7)
                    };
                    Response.Cookies.Append("refreshToken", sesion.RefreshToken, cookieOptions);

                }
            }
            catch (Exception ex) 
            {
                respuesta.Codigo = ex.HResult.ToString();
                respuesta.TipoRespuesta = false;
                respuesta.Mensaje = ex.Message;
            }




            return respuesta;
        }

    }
}
