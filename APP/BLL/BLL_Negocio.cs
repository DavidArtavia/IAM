using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_Negocio
    {
        DAL_Negocio dal_negocio = new DAL_Negocio();
        public Task<DTO_Respuesta> obtenerNegocios(DTO_Usuario usuario, DTO_FiltroEstado filtro)
        {

            return dal_negocio.obtenerNegocios(usuario, filtro);
        }
        public Task<DTO_Respuesta> registrarNegocio(DTO_Negocio negocio)
        {
            return dal_negocio.registrarNegocio(negocio);
        }
        public Task<DTO_Respuesta> actualizarNegocio(DTO_Negocio negocio)
        {
            return dal_negocio.actualizarNegocio(negocio);
        }

    }
}
