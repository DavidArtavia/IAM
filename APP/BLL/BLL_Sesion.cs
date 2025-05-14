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
        DTO_Respuesta respuesta = new DTO_Respuesta();
        BLL_Usuario bLL_Usuario = new BLL_Usuario();
        DTO_Usuario usuario = new DTO_Usuario();    
        public DTO_Respuesta guardarRefreshToken(DTO_Sesion sesion)
        {
            return dAL_Sesion.guardarRefreshToken(sesion);
        }

        public DTO_Respuesta validarRefreshToken(DTO_Sesion sesion)
        {
            respuesta = dAL_Sesion.validarRefreshToken(sesion);

            if (respuesta.TipoRespuesta)
            {
                //Refresh token es válido
                respuesta.Resultado.Add(sesion);
            } else 
            {
                //Verificamos si la razón de que el código no sea válido es únicamente la fecha d evencimiento
                if (respuesta.Codigo == "A0018")
                {
                    //Si es por vencimiento toca guardar un nuevo refresh token
                    sesion.ReemplazadoPorToken = sesion.RefreshToken;
                    sesion.RefreshToken = Guid.NewGuid().ToString();
                    respuesta = dAL_Sesion.guardarRefreshToken(sesion);
                    respuesta.Resultado.Add(sesion);
                }
                else
                {
                    //sino metemos la misma sesion
                    respuesta.Resultado.Add(sesion);
                }

                    //Si es por otro motivo, devolvemos al usuario al LOGIN
            }

            return respuesta;
        }
    }
}
