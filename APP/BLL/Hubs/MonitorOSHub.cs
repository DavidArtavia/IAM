using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.CognitiveServices.Speech.Transcription;
using System.Security.Claims;

namespace BLL.Hubs
{
    [Authorize]
    public class MonitorOSHub : Hub
    {
        public async Task ActualizarMonitor(string usuario, string mensaje)
        {
            await Clients.Users(usuario).SendAsync("RecibirMensaje", usuario, mensaje);
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }
    }
}
