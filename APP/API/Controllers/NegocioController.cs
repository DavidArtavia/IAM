using BLL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UTL;

namespace API.Controllers
{
    [Route("api/[controller]")]
    public class NegocioController : Controller
    {
        UTL_ManejoError manejoError = new UTL_ManejoError();
        BLL_Negocio bLL_Negocio = new BLL_Negocio();

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("registrarNegocio")]
        [HttpPost]
        public DTO_Respuesta registrarNegocio([FromBody] DTO_Negocio negocio)
        {
            DTO_Respuesta respuesta;
            BLL_Negocio bLL_Negocio;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            try
            {
                if (userIdClaim == null) throw new UnauthorizedAccessException("User ID claim is missing.");
                negocio.ID_Usuario = Convert.ToInt32(userIdClaim.Value);
                bLL_Negocio = new();
                respuesta = bLL_Negocio.registrarNegocio(negocio);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }

            return respuesta;
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("obtenerNegocios")]
        [HttpPost]
        public DTO_Respuesta obtenerNegocios()
        {
            DTO_Respuesta respuesta;

            try
            {
                DTO_Usuario usuario = new();
                usuario.ID_Usuario = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                respuesta = bLL_Negocio.obtenerNegocios(usuario);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("actualizarNegocio")]
        [HttpPost]
        public DTO_Respuesta actualizarNegocio([FromBody] DTO_Negocio negocio)
        {
            DTO_Respuesta respuesta;
            BLL_Negocio bLL_Negocio;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            try
            {
                if (userIdClaim == null) throw new UnauthorizedAccessException("User ID claim is missing.");
                negocio.ID_Usuario = Convert.ToInt32(userIdClaim.Value);
                bLL_Negocio = new();
                respuesta = bLL_Negocio.actualizarNegocio(negocio);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }

            return respuesta;
        }

    }
}
