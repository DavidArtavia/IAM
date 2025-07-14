using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_MetricaKPI
    {
        DTO_Respuesta respuesta = new();
        DAL_MetricaKPI dAL_MetricaKPI = new();
        public async Task<DTO_Respuesta> obtenerMetrica(DTO_MetricaKPI metricaKPI, DTO_Usuario usuario)
        {
            respuesta = await dAL_MetricaKPI.obtenerMetrica(metricaKPI, usuario);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);

            return respuesta;

        }
    }
}
