using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_Mensaje
    {
        DAL_Mensaje dAL_Mensaje = new();
        DTO_Respuesta respuesta = new();

        public DTO_Respuesta obtenerMensajes(DTO_ChatIA chatIA)
        {
            respuesta = dAL_Mensaje.obtenerMensajes(chatIA);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);

            return respuesta;

        }



        public DTO_Respuesta guardarMensaje(DTO_Mensaje mensaje)
        {
            respuesta = dAL_Mensaje.guardarMensaje(mensaje);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);
            return respuesta;
        }
    }
}
