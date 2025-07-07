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
        public DTO_Respuesta obtenerCuenta(DTO_Negocio negocio)
        {
            return dal_cuenta.obtenerCuenta(negocio);
        }
        public DTO_Respuesta registrarCuenta(DTO_Cuenta cuenta)
        {
            return dal_cuenta.registrarCuenta(cuenta);
        }
        public DTO_Respuesta actualizarCuenta(DTO_Cuenta cuenta)
        {
            return dal_cuenta.actualizarCuenta(cuenta);
        }
    }
}
