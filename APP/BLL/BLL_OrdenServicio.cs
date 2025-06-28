using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UTL;

namespace BLL
{
    public class BLL_OrdenServicio
    {
        DAL_OrdenServicio dal_OrdenServicio = new();
        DTO_Respuesta respuesta = new();
        private readonly BLL_Notificador _notificador;

        public BLL_OrdenServicio(BLL_Notificador notificador)
        {
            _notificador = notificador;
        }

        public async Task<DTO_Respuesta> registrarOrdenServicio(DTO_OrdenServicio ordenServicio, DTO_Usuario usuario)
        {
            respuesta = await dal_OrdenServicio.registrarOrdenServicio(ordenServicio);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);

            await _notificador.EnviarNotificacion(usuario, respuesta.Resultado[0]);

            return respuesta;
        }
        public async Task<DTO_Respuesta> actualizarOrdenServicio(DTO_OrdenServicio ordenServicio, DTO_Usuario usuario)
        {
            respuesta = await dal_OrdenServicio.actualizarOrdenServicio(ordenServicio);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);

            await _notificador.EnviarNotificacion(usuario, respuesta.Resultado[0]);

            return respuesta;
        }

        public async Task<DTO_Respuesta> buscarOrdenServicio(DTO_OrdenServicio ordenServicio, DTO_Cliente cliente)
        {
            respuesta = await dal_OrdenServicio.buscarOrdenServicio(ordenServicio, cliente);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);
            return respuesta;
        }
        public DTO_Respuesta obtenerOrdenDeServicio(DTO_Negocio negocio)
        {
            respuesta = dal_OrdenServicio.obtenerOrdenDeServicio(negocio);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);
            return respuesta;
        }
    }
}
