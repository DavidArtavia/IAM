using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
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
        public class ItemOrdenServicioController : ControllerBase
        {
            private UTL_ManejoError manejoError = new();
            private BLL_ItemOrdenServicio bLL_ItemOrdenServicio = new();
            private DTO_Respuesta respuesta = new();
            DTO_Usuario usuario = new();

            // Endpoint para guardar un ítem de orden de servicio
            [Authorize(Roles = "1")]
            [Produces("application/json")]
            [Route("guardarItemOrdenServicio")]
            [HttpPost]
            public async Task<DTO_Respuesta> guardarItemOrdenServicio([FromBody] DTO_ItemOrdenServicio itemOrdenServicio)
            {
                try
                {
                    respuesta = await bLL_ItemOrdenServicio.guardarItemOrdenServicio(itemOrdenServicio);
                }
                catch (Exception ex)
                {
                    respuesta = manejoError.errorNoControlado(ex);
                }

                return respuesta;
            }

            // Endpoint para actualizar un ítem de orden de servicio
            [Authorize(Roles = "1")]
            [Produces("application/json")]
            [Route("actualizarItemOrdenServicio")]
            [HttpPost]
            public async Task<DTO_Respuesta> actualizarItemOrdenServicio([FromBody] DTO_ItemOrdenServicio itemOrdenServicio)
            {
                try
                {
                    respuesta = await bLL_ItemOrdenServicio.actualizarItemOrdenServicio(itemOrdenServicio);
                }
                catch (Exception ex)
                {
                    respuesta = manejoError.errorNoControlado(ex);
                }

                return respuesta;
            }

            // Endpoint para obtener un ítem de orden de servicio
            [Authorize(Roles = "1")]
            [Produces("application/json")]
            [Route("obtenerItemOrdenServicio")]
            [HttpPost]
            public async Task<DTO_Respuesta> obtenerItemOrdenServicio([FromBody] DTO_ItemOrdenServicio itemOrdenServicio)
            {
                try
                {
                    respuesta = await bLL_ItemOrdenServicio.obtenerItemOrdenServicio(itemOrdenServicio);
                }
                catch (Exception ex)
                {
                    respuesta = manejoError.errorNoControlado(ex);
                }

                return respuesta;
            }
        }
    }

}
