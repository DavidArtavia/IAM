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

            var fecha = DateTime.UtcNow;

            await _emailSender.SendVerificationCodeAsync(to!, "Danny", "1a2b", fecha);

            return Ok(new { ok = true, to });
        }
    }
}