using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_Transacciones
    {
        DAL_Transacciones dal_trasacciones = new();
        public async Task<DTO_Respuesta> registrarTransaccion(DTO_Transacciones transaccion)
        {
            return await dal_trasacciones.registrarTransaccion(transaccion);
        }
        public async Task<DTO_Respuesta> obtenerTransaccion(DTO_Negocio negocio)
        {

            return await dal_trasacciones.obtenerTransaccion(negocio);
        }
        public async Task<DTO_Respuesta> actualizarTransaccion(DTO_Transacciones transaccion)
        {
            return await dal_trasacciones.actualizarTransaccion(transaccion);
        }

    }
}
