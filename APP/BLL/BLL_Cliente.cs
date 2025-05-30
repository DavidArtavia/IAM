using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_Cliente
    {
        DAL_Cliente dAL_Cliente = new DAL_Cliente();
        DTO_Respuesta respuesta = new();
        public DTO_Respuesta buscarCliente(DTO_Cliente cliente)
        {
            respuesta = dAL_Cliente.buscarCliente(cliente);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);
            return respuesta;
        }

        public DTO_Respuesta guardarCliente(DTO_Usuario usuario, DTO_Cliente cliente)
        {
            respuesta = dAL_Cliente.guardarCliente(usuario, cliente);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);
            return respuesta;
        }
    }
}
