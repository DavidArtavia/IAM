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
        DAL_Contexto dAL_Contexto = new();
        DTO_Respuesta respuesta = new();
        public async Task<DTO_Respuesta> obtenerContexto(DTO_Usuario usuario, DTO_ChatIA chat)
        {
            respuesta = await dAL_Contexto.obtenerContexto(usuario, chat);

            if(!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);

            return respuesta;
        }
    }
}
