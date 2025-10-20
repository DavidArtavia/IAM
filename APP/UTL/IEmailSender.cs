using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UTL
{
    public interface IEmailSender
    {
        Task SendAsync(string toEmail, string subject, string htmlBody, string? textBody = null, string? replyTo = null);
        Task SendVerificationCodeAsync(string toEmail, string? toName, string code, DateTime? expiresAt);
    }
}
