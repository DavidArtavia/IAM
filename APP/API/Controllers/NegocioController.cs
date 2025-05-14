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
        [Route("obtenerNegocios")]
        [HttpPost]
        public DTO_Respuesta obtenerNegocios()
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();

            try
            {

                DTO_Usuario usuario = new DTO_Usuario();
                usuario.ID_Usuario = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                respuesta = bLL_Negocio.obtenerNegocios(usuario);

            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }
    }
}
