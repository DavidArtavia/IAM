using BLL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UTL;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MetricaKPIController : Controller
    {
        DTO_Respuesta respuesta = new();
        BLL_MetricaKPI bLL_MetricaKPI = new BLL_MetricaKPI();
        private UTL_ManejoError manejoError = new();

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("obtenerMetrica")]
        [HttpPost]
        public async Task<DTO_Respuesta> obtenerMetrica(DTO_MetricaKPI metricaKPI)
        {
            try
            {
                DTO_Usuario usuario = UTL_SesionHelper.obtenerUsuarioSesion(User.Claims);


                respuesta = await bLL_MetricaKPI.obtenerMetrica(metricaKPI, usuario);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }
    }
}
