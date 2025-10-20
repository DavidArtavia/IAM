using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UTL
{
    public class ResendSettings
    {

        public string ApiKey { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
        public string FromName { get; set; } = "IAM Suit";
        public string? ReplyTo { get; set; }


    }
}
