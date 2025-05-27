using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_Cuenta
    {

        DAL_Cuenta dal_cuenta = new();
        public DTO_Respuesta obtenerCuentaPorPagar(DTO_Negocio negocio)
        {
            return dal_cuenta.obtenerCuentaPorPagar(negocio);
        }
        public DTO_Respuesta registrarCuentaPorPagar(DTO_CuentaPorPagar cuentaPorPagar)
        {
            return dal_cuenta.registrarCuentaPorPagar(cuentaPorPagar);
        }
        public DTO_Respuesta actualizarCuentaPorPagar(DTO_CuentaPorPagar cuentaPorPagar)
        {
            return dal_cuenta.actualizarCuentaPorPagar(cuentaPorPagar);
        }
    }
}
