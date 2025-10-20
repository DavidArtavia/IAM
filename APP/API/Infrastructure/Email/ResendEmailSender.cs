using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Resend;
using UTL;

namespace API.Infrastructure.Email
{
    // Compatible con paquete comunitario "Resend" v0.1.6:
    // EmailMessage + EmailAddressList + EmailSendAsync
    public class ResendEmailSender : IEmailSender
    {
        private readonly IResend _resend;
        private readonly ResendSettings _settings;
        private readonly ILogger<ResendEmailSender> _logger;

        public ResendEmailSender(IResend resend, IOptions<ResendSettings> options, ILogger<ResendEmailSender> logger)
        {
            _resend = resend ?? throw new ArgumentNullException(nameof(resend));
            _settings = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task SendAsync(string toEmail, string subject, string htmlBody, string? textBody = null, string? replyTo = null)
        {
            if (string.IsNullOrWhiteSpace(_settings.From))
                throw new InvalidOperationException("ResendSettings.From está vacío. Configure Resend:From.");

            var from = string.IsNullOrWhiteSpace(_settings.FromName)
                ? _settings.From
                : $"{_settings.FromName} <{_settings.From}>";

            var message = new EmailMessage
            {
                From = from,
                // EmailAddressList en Resend 0.1.6
                To = EmailAddressList.From(toEmail),
                Subject = subject,
                HtmlBody = htmlBody ?? string.Empty,
                TextBody = textBody ?? string.Empty
            };

            var rt = replyTo ?? _settings.ReplyTo;
            if (!string.IsNullOrWhiteSpace(rt))
            {
                message.ReplyTo = EmailAddressList.From(rt);
            }

            try
            {
                _logger.LogInformation("Resend: enviando email a {To} con From {From} Subject {Subject}", toEmail, message.From, subject);
                await _resend.EmailSendAsync(message);
                _logger.LogInformation("Resend: email solicitado. Revisa el dashboard de Resend para el estado final.");
            }
            catch (ResendException rex)
            {
                _logger.LogError(rex, "ResendException al enviar a {To}. {Msg}", toEmail, rex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error no controlado al enviar a {To}", toEmail);
                throw;
            }
        }

        public async Task SendVerificationCodeAsync(string toEmail, string? toName, string code, DateTime? expiresAt)
        {
            var (subject, html, text) = EmailTemplates.VerificationCode(toName, code, expiresAt);
            await SendAsync(toEmail, subject, html, text);
        }
    }
}