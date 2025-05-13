using Azure;
using BLL;
using DAL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using UTL;


namespace API.Controllers
{
   
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        DTO_Respuesta respuesta = new DTO_Respuesta();
        UTL_ManejoError manejoError = new UTL_ManejoError();

        [AllowAnonymous]
        [Produces("application/json")]
        [Route("registrarUsuario")]
        [HttpPost]
        public DTO_Respuesta registrarUsuario([FromBody] DTO_Usuario usuario)
        {
            Console.WriteLine(usuario);

            try
            {
                BLL_Usuario bLL_Usuario = new BLL_Usuario();
                respuesta = bLL_Usuario.registrarUsuario(usuario);
            }
            catch (Exception ex) 
            {
                respuesta = manejoError.errorNoControlado(ex);
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
            DAL_Sesion dAL_Sesion = new DAL_Sesion();
            
                
            try
            {
                //Validamos la cuestión
                BLL_Usuario bLL_Usuario = new BLL_Usuario();
                respuesta = bLL_Usuario.autenticarUsuario(usuario);

                //Si autentica correctamente procedemos
                if (respuesta.TipoRespuesta)
                {
                    usuario = (DTO_Usuario)respuesta.Resultado[0];

                    //Creamos el accesToken
                    String accesToken = uTL_Cipher.generarAccessToken((DTO_Usuario)respuesta.Resultado[0]);
                    sesion.RefreshToken = Guid.NewGuid().ToString();
                    sesion.ID_Usuario = usuario.ID_Usuario;
                    respuesta.Resultado.Add(new { accesToken = accesToken });
                    //Guardar el refreshToken y obtenemos la respuesta
                    DTO_Respuesta respuestaRefreshToken = dAL_Sesion.guardarRefreshToken(sesion);
                    if (respuestaRefreshToken.TipoRespuesta)
                    {
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
                    else
                    {
                        respuesta = respuestaRefreshToken;
                    }

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
        [Route("pruebasSesion")]
        [HttpPost]
        public DTO_Respuesta pruebasSesion()
        {
            return new DTO_Respuesta();
        }

    }
}
