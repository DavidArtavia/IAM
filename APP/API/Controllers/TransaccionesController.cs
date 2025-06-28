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
    public class TransaccionesController : ControllerBase
    {
        private UTL_ManejoError manejoError = new();
        private BLL_Transacciones bLL_Transacciones = new();
        private DTO_Respuesta respuesta = new();

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("registrarTransaccion")]
        [HttpPost]
        public async Task<DTO_Respuesta> registrarTransaccion([FromBody] DTO_Transacciones transaccion)
        {

            try
            {
                respuesta = await bLL_Transacciones.registrarTransaccion(transaccion);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }

            return respuesta;
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("obtenerTransaccion")]
        [HttpPost]
        public async Task<DTO_Respuesta> obtenerTransaccion([FromBody] DTO_Negocio negocio)
        {
            try
            {
                respuesta = await bLL_Transacciones.obtenerTransaccion(negocio);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("actualizarTransaccion")]
        [HttpPost]
        public async Task<DTO_Respuesta> actualizarTransaccion([FromBody] DTO_Transacciones transaccion)
        {
            try
            {
                respuesta = await bLL_Transacciones.actualizarTransaccion(transaccion);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }

            return respuesta;
        }



    }
}
