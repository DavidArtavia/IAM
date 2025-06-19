using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_ItemOrdenServicio
    {
        private DAL_ItemOrdenServicio dAL_ItemOrdenServicio = new DAL_ItemOrdenServicio();
        DTO_Respuesta respuesta = new();
        public async Task<DTO_Respuesta> guardarItemOrdenServicio(DTO_ItemOrdenServicio itemOrdenServicio)
        {
                respuesta  = await dAL_ItemOrdenServicio.guardarItemOrdenServicio(itemOrdenServicio);

                if (!respuesta.TipoRespuesta)
                    throw new Exception(respuesta.Mensaje);

                return respuesta;
        }

        public async Task<DTO_Respuesta> actualizarItemOrdenServicio(DTO_ItemOrdenServicio itemOrdenServicio)
        {
                respuesta = await dAL_ItemOrdenServicio.actualizarItemOrdenServicio(itemOrdenServicio);

                if (!respuesta.TipoRespuesta)
                    throw new Exception(respuesta.Mensaje);

                return respuesta;
        }

        public async Task<DTO_Respuesta> obtenerItemOrdenServicio(DTO_ItemOrdenServicio itemOrdenServicio)
        {
                respuesta = await dAL_ItemOrdenServicio.obtenerItemOrdenServicio(itemOrdenServicio);

                if (!respuesta.TipoRespuesta)
                    throw new Exception(respuesta.Mensaje);

                return respuesta;
        }
    }

}
