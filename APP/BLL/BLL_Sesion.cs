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
    public class BLL_Sesion
    {

        DAL_Sesion dAL_Sesion = new DAL_Sesion();
        public DTO_Respuesta registrarUsuario(DTO_Sesion sesion)
        {
            return dAL_Sesion.guardarRefreshToken(sesion);
        }
    }
}
