using Azure;
using BLL;
using DAL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Security.Claims;
using UTL;


namespace API.Controllers
{
   
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        DTO_Respuesta respuesta = new DTO_Respuesta();
        UTL_ManejoError manejoError = new UTL_ManejoError();
        BLL_Usuario bLL_Usuario = new BLL_Usuario();

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
            BLL_Sesion bLL_Sesion = new BLL_Sesion();
            
                
            try
            {
                //Validamos la cuestión
                BLL_Usuario bLL_Usuario = new BLL_Usuario();
                respuesta = bLL_Usuario.autenticarUsuario(usuario);
                var ejemplo = JsonConvert.SerializeObject(new DTO_Respuesta());

                //Si autentica correctamente procedemos
                if (respuesta.TipoRespuesta)
                {
                    usuario = (DTO_Usuario)respuesta.Resultado[0];

                    //Creamos el accesToken
                    String accesToken = uTL_Cipher.generarAccessToken(usuario);
                    sesion.RefreshToken = Guid.NewGuid().ToString();
                    sesion.ID_Usuario = usuario.ID_Usuario;
                    respuesta.Resultado.Add(new { accesToken });
                    //Guardar el refreshToken y obtenemos la respuesta
                    DTO_Respuesta respuestaRefreshToken = bLL_Sesion.guardarRefreshToken(sesion);
                    if (respuestaRefreshToken.TipoRespuesta)
                    {
                        //Agregamos el refreshToken a una Cookie HttpOnly
                        var cookieOptions = uTL_Cipher.cookieOptions();
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


        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("obtenerUsuarioPorId")]
        [HttpPost]
        public DTO_Respuesta obtenerUsuarioPorId()
        {
            DTO_Usuario usuario = new DTO_Usuario();
            //todo: recuperar el id del usuario desde el token para el crear negocio
            usuario.ID_Usuario = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return bLL_Usuario.obtenerUsuarioPorId(usuario);
        }

    }
}
