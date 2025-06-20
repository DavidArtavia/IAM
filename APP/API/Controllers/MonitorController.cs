using BLL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UTL;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MonitorController : Controller
    {
        DTO_Respuesta respuesta = new();
        BLL_Monitor bLl_monitor = new BLL_Monitor();
        private UTL_ManejoError manejoError = new();

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("cargarMonitorOrdenServicio")]
        [HttpPost]
        public DTO_Respuesta cargarMonitorOrdenServicio(DTO_Negocio negocio)
        {
            try
            {
                respuesta = bLl_monitor.cargarMonitorOrdenServicio(negocio);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }
    }
}
