using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_Monitor
    {
        DAL_Monitor dAL_Monitor = new DAL_Monitor();    
        DTO_Respuesta respuesta = new();
        public DTO_Respuesta cargarMonitorOrdenServicio(DTO_Negocio negocio)
        {
            respuesta = dAL_Monitor.cargarMonitorOrdenServicio(negocio);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);
            return respuesta;
        }
    }
}
