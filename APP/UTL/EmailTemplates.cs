using System;
using System.Net;

namespace UTL
{
    public static class EmailTemplates
    {
        public static (string Subject, string Html, string Text) VerificationCode(string? toName, string code, DateTime? expiresAt)
        {
            var subject = "Código de verificación";
            var expText = expiresAt.HasValue ? $" antes de {expiresAt:yyyy-MM-dd HH:mm}" : string.Empty;

            var safeCode = WebUtility.HtmlEncode(code);
            var namePart = string.IsNullOrWhiteSpace(toName) ? "" : WebUtility.HtmlEncode(toName);

            var html = $@"
<div style='font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#111;line-height:1.5'>
  {(string.IsNullOrEmpty(namePart) ? "" : $"<p>Hola {namePart},</p>")}
  <p>Tu código de verificación es:</p>
  <p style='font-size:22px;font-weight:700;letter-spacing:3px;margin:16px 0'>{safeCode}</p>
  <p>Ingresa este código en la aplicación{(expiresAt.HasValue ? $" antes de <b>{expiresAt:yyyy-MM-dd HH:mm}</b>" : "")}.</p>
  <p style='color:#666;margin-top:24px'>Si no solicitaste este código, ignora este mensaje.</p>
  <p style='margin-top:12px'>— Equipo IAM Suit</p>
</div>";

            var text =
                (string.IsNullOrWhiteSpace(toName) ? "" : $"Hola {toName},\n\n") +
                $"Tu código de verificación es: {code}\n" +
                $"Ingresa este código en la aplicación{expText}.\n\n" +
                "Si no solicitaste este código, ignora este mensaje.\n" +
                "— Equipo IAM Suit";

            return (subject, html, text);
        }
    }
}