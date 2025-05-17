using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_Contexto
    {
        DAL_Contexto dAL_Contexto = new DAL_Contexto();
        public DTO_Respuesta obtenerContexto()
        {
            return dAL_Contexto.obtenerContexto();  
        }
    }
}
