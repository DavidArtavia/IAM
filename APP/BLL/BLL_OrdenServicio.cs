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

        public async Task<DTO_Respuesta> registrarOrdenServicio(DTO_OrdenServicio ordenServicio)
        {
            respuesta = await dal_OrdenServicio.registrarOrdenServicio(ordenServicio);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);
            return respuesta;
        }
        public DTO_Respuesta obtenerOrdenesServicio(DTO_Usuario usuario)
        {
            return dal_OrdenServicio.obtenerOrdenesServicio(usuario);
        }
        public DTO_Respuesta actualizarOrdenServicio(DTO_OrdenServicio ordenServicio)
        {
            return dal_OrdenServicio.actualizarOrdenServicio(ordenServicio);
        }

    }
}
