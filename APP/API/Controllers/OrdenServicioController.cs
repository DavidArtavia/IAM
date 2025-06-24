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
        private BLL_OrdenServicio _bLL_OrdenServicio;

        public OrdenServicioController(BLL_OrdenServicio bLL_OrdenServicio)
        {
            _bLL_OrdenServicio = bLL_OrdenServicio;
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("registrarOrdenServicio")]
        [HttpPost]
        public async Task<DTO_Respuesta> registrarOrdenServicio([FromBody] DTO_OrdenServicio ordenServicio)
        {
            try
            {
                respuesta = await _bLL_OrdenServicio.registrarOrdenServicio(ordenServicio, UTL_SesionHelper.obtenerUsuarioSesion(User.Claims));
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
                respuesta = await _bLL_OrdenServicio.actualizarOrdenServicio(ordenServicio, UTL_SesionHelper.obtenerUsuarioSesion(User.Claims));
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }

            return respuesta;
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("obtenerOrdenDeServicio")]
        [HttpPost]
        public DTO_Respuesta obtenerOrdenDeServicio(DTO_Negocio negocio)
        {
            try
            {
                respuesta = _bLL_OrdenServicio.obtenerOrdenDeServicio(negocio);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }
    }
}
