using BLL;
using DAL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UTL;

namespace API.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class OrdenServicioController: ControllerBase
    {
        private DTO_Respuesta respuesta = new();
        private UTL_ManejoError manejoError = new();
        private BLL_OrdenServicio bLL_OrdenServicio = new();


        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("registrarOrdenServicio")]
        [HttpPost]
        public async Task<DTO_Respuesta> registrarOrdenServicio([FromBody] DTO_OrdenServicio ordenServicio)
        {
            try
            {
                respuesta = await bLL_OrdenServicio.registrarOrdenServicio(ordenServicio);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }

            return respuesta;
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("actualizarOrdenServicio")]
        [HttpPost]
        public async Task<DTO_Respuesta> actualizarOrdenServicio([FromBody] DTO_OrdenServicio ordenServicio)
        {
            try
            {
                respuesta = await bLL_OrdenServicio.actualizarOrdenServicio(ordenServicio);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }

            return respuesta;
        }

        //[Authorize(Roles = "1")]
        //[Produces("application/json")]
        //[Route("obtenerNegocios")]
        //[HttpPost]
        //public DTO_Respuesta obtenerNegocios()
        //{
        //    try
        //    {
        //        DTO_Usuario usuario = new();
        //        usuario.ID_Usuario = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        //        respuesta = bLL_Negocio.obtenerNegocios(usuario);
        //    }
        //    catch (Exception ex)
        //    {
        //        respuesta = manejoError.errorNoControlado(ex);
        //    }
        //    return respuesta;
        //}
    }
}
