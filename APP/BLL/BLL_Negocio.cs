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
        public DTO_Respuesta obtenerNegocios(DTO_Usuario usuario)
        {
            return dal_negocio.obtenerNegocios(usuario);
        }
    }
}
