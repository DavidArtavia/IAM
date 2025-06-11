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
    public class ClienteController : ControllerBase
    {
        private UTL_ManejoError manejoError = new();
        private BLL_Cliente bLL_Cliente = new();
        private DTO_Respuesta respuesta = new();
        DTO_Usuario usuario = new();

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("buscarClientes")]
        [HttpPost]

        public async Task<IActionResult> BuscarClientes([FromBody] DTO_SolicitudDeBusquedaDeCliente solicitud)
        {

            usuario.ID_Usuario = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var lista = await bLL_Cliente.BuscarClientesAsync(solicitud, usuario);
            return Ok(lista);
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("obtenerClientes")]
        [HttpPost]
        public DTO_Respuesta obtenerClientes()
        {
            try
            {
                respuesta = bLL_Cliente.obtenerClientes();
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }

    }
}
