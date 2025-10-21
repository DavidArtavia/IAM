using System;
using System.Globalization;
using System.Net;

namespace UTL
{
    public static class EmailTemplates
    {
        // Paleta IAM
        private const string BrandColor = "#2563EB";   // Azul primario
        private const string BrandDark = "#0F172A";   // Slate-900
        private const string Muted = "#6B7280";   // Gray-500
        private const string Bg = "#F5F7FB";   // Fondo 
        private const string CardBg = "#FFFFFF";   // Fondo tarjeta

        // Logo público. Si se deja vacío o null, se usará el fallback “IAM”
        private const string LogoUrl = "";

        private const string AppName = "IAM Suit";

        public static (string Subject, string Html, string Text) VerificationCode(string? toName, string code, DateTime? expiresAt)
        {
            var subject = "Código de verificación";

            var safeCode = WebUtility.HtmlEncode(code);
            var safeName = string.IsNullOrWhiteSpace(toName) ? "" : WebUtility.HtmlEncode(toName);

            // PREHEADER para snippet de Gmail/Outlook
            var preheader = $"{AppName}: Tu código de verificación es {safeCode}";

       
            var hasLogo = !string.IsNullOrWhiteSpace(LogoUrl);
            var logoHtml = hasLogo
                ? $"<img src=\"{LogoUrl}\" alt=\"{AppName}\" height=\"38\" style=\"display:block;height:38px\">"
                : $"<div role=\"img\" aria-label=\"{AppName}\" style=\"font-weight:800;font-size:24px;letter-spacing:1px;color:{BrandDark}\"><span style=\"color:#000\">I</span><span style=\"color:{BrandColor}\">A</span><span style=\"color:#000\">M</span></div>";

         
            var html = $@"
<!DOCTYPE html>
<html lang=""es"" xml:lang=""es"">
  <head>
    <meta http-equiv=""Content-Type"" content=""text/html; charset=utf-8"">
    <meta http-equiv=""Content-Language"" content=""es-419"">
    <meta name=""language"" content=""es-419"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{subject}</title>
    <style>
      @media (prefers-color-scheme: dark) {{
        body, table, td {{ background-color: #0B1220 !important; color: #E5E7EB !important; }}
      }}
      a {{ text-decoration: none; }}
    </style>
  </head>
  <body style=""margin:0;padding:0;background:{Bg};font-family:Segoe UI,Roboto,Arial,sans-serif;color:{BrandDark}"">
    <!-- Preheader oculto -->
    <div style=""display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;visibility:hidden"">{preheader}</div>

    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""background:{Bg};padding:24px 0"">
      <tr>
        <td align=""center"">
          <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""width:600px;max-width:600px;background:{CardBg};border-radius:12px;box-shadow:0 2px 6px rgba(16,24,40,0.06);overflow:hidden;"">
            <!-- Header -->
            <tr>
              <td align=""center"" style=""padding:24px;background:#ffffff;border-bottom:1px solid #eef2f7"">
                {logoHtml}
              </td>
            </tr>

            <!-- Contenido -->
            <tr>
              <td style=""padding:28px 32px 24px 32px"">
                {(string.IsNullOrEmpty(safeName) ? "" : $@"<p style=""margin:0 0 8px 0;font-size:14px;color:{Muted}"">Hola {safeName},</p>")}
                <h1 style=""margin:0 0 12px 0;font-size:20px;line-height:28px;color:{BrandDark}"">Tu código de verificación</h1>
                <p style=""margin:0 0 20px 0;font-size:14px;line-height:22px;color:{Muted}"">
                  Usa el siguiente código para verificar tu cuenta:
                </p>

                <!-- Tarjeta con el código -->
                <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                  <tr>
                    <td align=""center"" style=""padding:20px;border:1px solid #E5E7EB;border-radius:10px;background:#FAFAFA"">
                      <div style=""font-size:28px;letter-spacing:6px;font-weight:800;font-family:Consolas,'Courier New',monospace;color:{BrandDark}"">
                        {safeCode}
                      </div>
                      
                    </td>
                  </tr>
                </table>

                <p style=""margin:20px 0 0 0;font-size:12px;line-height:20px;color:{Muted}"">
                  Si no solicitaste este código, simplemente ignora este mensaje.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align=""center"" style=""padding:14px 24px 24px 24px;font-size:12px;color:{Muted};background:#ffffff;border-top:1px solid #eef2f7"">
                — Equipo {AppName}
              </td>
            </tr>
          </table>

          <div style=""height:24px""></div>
        </td>
      </tr>
    </table>
  </body>
</html>";

            var text =
                (string.IsNullOrWhiteSpace(toName) ? "" : $"Hola {toName},\n\n") +
                $"Tu código de verificación es: {code}\n" +
                $"Ingresa este código en la aplicación.\n" +
                "Si no solicitaste este código, ignora este mensaje.\n" +
                $"— Equipo {AppName}";

            return (subject, html, text);
        }
    }
}