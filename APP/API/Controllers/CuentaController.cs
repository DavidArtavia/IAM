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
    public class CuentaController : ControllerBase
    {
        DTO_Respuesta respuesta = new();
        UTL_ManejoError manejoError = new();
        BLL_Cuenta bLL_Cuenta = new();


        [AllowAnonymous]
        [Produces("application/json")]
        [Route("registrarCuenta")]
        [HttpPost]
        public DTO_Respuesta registrarCuenta([FromBody] DTO_Cuenta cuenta)
        {
            try
            {
                respuesta = bLL_Cuenta.registrarCuenta(cuenta);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }

            return respuesta;
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("obtenerCuentas")]
        [HttpPost]
        public DTO_Respuesta obtenerCuenta([FromBody] DTO_Negocio negocio)
        {

            try
            {
                respuesta = bLL_Cuenta.obtenerCuenta(negocio);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }


        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("actualizarCuentas")]
        [HttpPost]
        public DTO_Respuesta actualizarCuenta([FromBody] DTO_Cuenta cuenta)
        {
            try
            {
                respuesta = bLL_Cuenta.actualizarCuenta(cuenta);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }

            return respuesta;
        }

    }

}