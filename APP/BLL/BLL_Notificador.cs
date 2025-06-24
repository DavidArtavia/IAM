using BLL.Hubs;
using DTO;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_Notificador
    {

        private readonly IHubContext<MonitorOSHub> _hubContext;

        public BLL_Notificador(IHubContext<MonitorOSHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task EnviarNotificacion(DTO_Usuario usuario, object mensaje)
        {
            await _hubContext.Clients.User(usuario.CorreoUsuario).SendAsync("RecibirNotificacion", mensaje);
        }
    }
}
