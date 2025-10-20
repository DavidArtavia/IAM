using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UTL;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailTestController : ControllerBase
    {
        private readonly IEmailSender _emailSender;

        public EmailTestController(IEmailSender emailSender)
        {
            _emailSender = emailSender;
        }

        public class TestEmailDto { public string? To { get; set; } }

        [Authorize]
        [HttpPost("send")]
        public async Task<IActionResult> Send([FromBody] TestEmailDto dto)
        {
            var to = dto?.To ?? User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrWhiteSpace(to)) return BadRequest("No hay correo destino.");

            await _emailSender.SendAsync(
                to,
                "Prueba de correo IAM Suit",
                "<strong>Funciona</strong>: prueba de HTML desde Resend.",
                "Funciona: prueba de texto plano.",
                null
            );
            return Ok(new { ok = true, to });
        }
    }
}