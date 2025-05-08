using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_Usuario
    {
        public DTO_Respuesta registrarUsuario(DTO_Usuario usuario)
        {
            DAL_Usuario dal_Usuario = new DAL_Usuario();
            return dal_Usuario.registrarUsuario(usuario);
        }
    }
}
