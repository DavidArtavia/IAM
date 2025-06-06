using BLL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UTL;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NegocioController : ControllerBase
    {
        private UTL_ManejoError manejoError = new();
        private BLL_Negocio bLL_Negocio = new();
        private DTO_Respuesta respuesta = new();

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("registrarNegocio")]
        [HttpPost]
        public DTO_Respuesta registrarNegocio([FromBody] DTO_Negocio negocio)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            try
            {
                if (userIdClaim == null) throw new UnauthorizedAccessException("User ID claim is missing.");
                negocio.ID_Usuario = Convert.ToInt32(userIdClaim.Value);
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
        public DTO_Respuesta obtenerNegocios([FromBody] DTO_FiltroEstado filtro)
        {
            try
            {
                DTO_Usuario usuario = new();
                usuario.ID_Usuario = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                respuesta = bLL_Negocio.obtenerNegocios(usuario, filtro);
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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            try
            {
                if (userIdClaim == null) throw new UnauthorizedAccessException("User ID claim is missing.");
                negocio.ID_Usuario = Convert.ToInt32(userIdClaim.Value);
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
