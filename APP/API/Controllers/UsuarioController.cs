using Azure;
using BLL;
using DAL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Security.Claims;
using UTL;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        DTO_Respuesta respuesta = new DTO_Respuesta();
        UTL_ManejoError manejoError = new UTL_ManejoError();
        BLL_Usuario bLL_Usuario = new BLL_Usuario();

        private readonly IEmailSender _emailSender;

        public UsuarioController(IEmailSender emailSender)
        {
            _emailSender = emailSender;
        }

        [AllowAnonymous]
        [Produces("application/json")]
        [Route("registrarUsuario")]
        [HttpPost]
        public DTO_Respuesta registrarUsuario([FromBody] DTO_Usuario usuario)
        {
            try
            {
                BLL_Usuario bLL_Usuario = new BLL_Usuario();
                respuesta = bLL_Usuario.registrarUsuario(usuario);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }

        [AllowAnonymous]
        [Produces("application/json")]
        [Route("autenticarUsuario")]
        [HttpPost]
        public DTO_Respuesta autenticarUsuario([FromBody] DTO_Usuario usuario)
        {
            UTL_Cipher uTL_Cipher = new UTL_Cipher();
            DTO.DTO_Sesion sesion = new DTO_Sesion();
            BLL_Sesion bLL_Sesion = new BLL_Sesion();

            try
            {
                BLL_Usuario bLL_Usuario = new BLL_Usuario();
                respuesta = bLL_Usuario.autenticarUsuario(usuario);
                var ejemplo = JsonConvert.SerializeObject(new DTO_Respuesta());

                if (respuesta.TipoRespuesta)
                {
                    usuario = (DTO_Usuario)respuesta.Resultado[0];

                    string accesToken = uTL_Cipher.generarAccessToken(usuario);
                    sesion.RefreshToken = Guid.NewGuid().ToString();
                    sesion.ID_Usuario = usuario.ID_Usuario;

                    respuesta.Resultado.Add(new { accesToken });

                    DTO_Respuesta respuestaRefreshToken = bLL_Sesion.guardarRefreshToken(sesion);
                    if (respuestaRefreshToken.TipoRespuesta)
                    {
                        var cookieOptions = uTL_Cipher.cookieOptions();
                        Response.Cookies.Append("refreshToken", sesion.RefreshToken, cookieOptions);
                    }
                    else
                    {
                        respuesta = respuestaRefreshToken;
                    }
                }
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("pruebasSesion")]
        [HttpPost]
        public DTO_Respuesta pruebasSesion()
        {
            return new DTO_Respuesta();
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("obtenerUsuarioPorId")]
        [HttpPost]
        public DTO_Respuesta obtenerUsuarioPorId()
        {
            DTO_Usuario usuario = new DTO_Usuario();
            usuario.ID_Usuario = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return bLL_Usuario.obtenerUsuarioPorId(usuario);
        }

        [Authorize(Roles = "1")]
        [Produces("application/json")]
        [Route("actualizarUsuario")]
        [HttpPost]
        public DTO_Respuesta actualizarUsuario([FromBody] DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta;
            BLL_Usuario bLL_usuario;
            try
            {
                bLL_usuario = new();
                respuesta = bLL_usuario.actualizarUsuario(usuario);
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }

        [Authorize]
        [Produces("application/json")]
        [HttpPost]
        [Route("generarCodigoVerificacion")]
        public DTO_Respuesta GenerarCodigoVerificacion([FromBody] DTO_Usuario usuario)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) throw new UnauthorizedAccessException("User ID claim is missing.");
                usuario.ID_Usuario = Convert.ToInt32(userIdClaim.Value);

                respuesta = bLL_Usuario.GenerarCodigoVerificacion(usuario);

                bool emailEnviado = false;

                if (respuesta.TipoRespuesta)
                {
                    var codeDto = respuesta.Resultado.OfType<DTO_CodigoVerificacion>().FirstOrDefault();
                    if (codeDto != null)
                    {
                        var codigo = codeDto.CodigoAlfaNum;
                        var expira = codeDto.FechaExpiracion;

                        var email = User.FindFirst(ClaimTypes.Email)?.Value;
                        string? nombre = null;

                        if (string.IsNullOrWhiteSpace(email))
                        {
                            var r2 = bLL_Usuario.obtenerUsuarioPorId(new DTO_Usuario { ID_Usuario = usuario.ID_Usuario });
                            if (r2.TipoRespuesta && r2.Resultado.Count > 0)
                            {
                                var u = (DTO_Usuario)r2.Resultado[0];
                                email = u.CorreoUsuario;
                                nombre = $"{u.NombreUsuario} {u.Apellido}".Trim();
                            }
                        }

                        if (!string.IsNullOrEmpty(usuario.NombreUsuario))
                        {
                            nombre = $"{usuario.NombreUsuario} {usuario?.Apellido}".Trim();
                        }


                            if (!string.IsNullOrWhiteSpace(email))
                        {
                            // Hacer await para no perder errores ni el envío
                            _emailSender.SendVerificationCodeAsync(email!, nombre, codigo, expira).GetAwaiter().GetResult();
                            emailEnviado = true;
                        }
                    }
                }

                // Añadir un resultado con el flag emailEnviado para que el FE muestre el mensaje correcto
                respuesta.Resultado.Add(new { emailEnviado });
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }

        [Authorize]
        [Produces("application/json")]
        [HttpPost]
        [Route("reenviarCodigoVerificacion")]
        public DTO_Respuesta ReenviarCodigoVerificacion([FromBody] DTO_Usuario usuario)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) throw new UnauthorizedAccessException("User ID claim is missing.");
                usuario.ID_Usuario = Convert.ToInt32(userIdClaim.Value);

                respuesta = bLL_Usuario.ReenviarCodigoVerificacion(usuario);

                bool emailEnviado = false;

                if (respuesta.TipoRespuesta)
                {
                    var codeDto = respuesta.Resultado.OfType<DTO_CodigoVerificacion>().FirstOrDefault();
                    if (codeDto != null)
                    {
                        var codigo = codeDto.CodigoAlfaNum;
                        var expira = codeDto.FechaExpiracion;

                        var email = User.FindFirst(ClaimTypes.Email)?.Value;
                        string? nombre = null;

                        if (string.IsNullOrWhiteSpace(email))
                        {
                            var r2 = bLL_Usuario.obtenerUsuarioPorId(new DTO_Usuario { ID_Usuario = usuario.ID_Usuario });
                            if (r2.TipoRespuesta && r2.Resultado.Count > 0)
                            {
                                var u = (DTO_Usuario)r2.Resultado[0];
                                email = u.CorreoUsuario;
                                nombre = $"{u.NombreUsuario} {u.Apellido}".Trim();
                            }
                        }


                        if (!string.IsNullOrEmpty(usuario.NombreUsuario))
                        {
                            nombre = $"{usuario.NombreUsuario} {usuario?.Apellido}".Trim();
                        }

                        if (!string.IsNullOrWhiteSpace(email))
                        {
                            _emailSender.SendVerificationCodeAsync(email!, nombre, codigo, expira).GetAwaiter().GetResult();
                            emailEnviado = true;
                        }
                    }
                }

                respuesta.Resultado.Add(new { emailEnviado });
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }

        [Authorize]
        [Produces("application/json")]
        [HttpPost]
        [Route("validarCodigoVerificacion")]
        public DTO_Respuesta ValidarCodigoVerificacion([FromBody] DTO_Usuario usuario)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) throw new UnauthorizedAccessException("User ID claim is missing.");
                usuario.ID_Usuario = Convert.ToInt32(userIdClaim.Value);
                respuesta = bLL_Usuario.ValidarCodigoVerificacion(usuario);

                if (respuesta.TipoRespuesta)
                {
                    DTO_Usuario u = new DTO_Usuario() { ID_Usuario = usuario.ID_Usuario };
                    var r2 = bLL_Usuario.obtenerUsuarioPorId(u);
                    if (r2.TipoRespuesta && r2.Resultado.Count > 0)
                    {
                        var usuarioActual = (DTO_Usuario)r2.Resultado[0];
                        var cipher = new UTL_Cipher();
                        string accesToken = cipher.generarAccessToken(usuarioActual);
                        respuesta.Resultado.Add(new { accesToken });
                    }
                }
            }
            catch (Exception ex)
            {
                respuesta = manejoError.errorNoControlado(ex);
            }
            return respuesta;
        }
    }
}