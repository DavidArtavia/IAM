using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UTL
{
    public class UTL_ManejoError
    {
        public DTO_Respuesta errorNoControlado(Exception ex)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            respuesta.Codigo = ex.HResult.ToString();
            respuesta.TipoRespuesta = false;
            respuesta.Mensaje = ex.Message;
            return respuesta;
        }

    }
}
