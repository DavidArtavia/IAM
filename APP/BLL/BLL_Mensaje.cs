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
        DAL_Mensaje dAL_Mensaje = new DAL_Mensaje();
        public DTO_Respuesta obtenerMensajes(DTO_ChatIA chatIA)
        {
            return dAL_Mensaje.obtenerMensajes(chatIA);
        }        
        
        public DTO_Respuesta guardarMensaje(DTO_Mensaje mensaje)
        {
            return dAL_Mensaje.guardarMensaje(mensaje);
        }
    }
}
