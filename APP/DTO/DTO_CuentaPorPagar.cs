using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO
{
    public class DTO_CuentaPorPagar
    {
        #region Atributos

        private int iD_CuentasPorPagar;
        private int iD_Negocio;
        private DTO_Estado estado;
        private string concepto;
        private string descripcion;
        private decimal saldo;
        private DateTime fechaInicial;
        private DateTime fechaModificacion;

        #endregion

        #region Constructor
        public DTO_CuentaPorPagar()
        {
            ID_CuentasPorPagar = 0;
            ID_Negocio = 0;
            Estado = new DTO_Estado();
            Concepto = string.Empty;
            Descripcion = string.Empty;
            Saldo = 0.0m;
            FechaInicial = DateTime.Now;
            FechaModificacion = DateTime.Now;
        }

        #endregion

        #region Set´s y Get's

        public int ID_CuentasPorPagar { get => iD_CuentasPorPagar; set => iD_CuentasPorPagar = value; }
        public int ID_Negocio { get => iD_Negocio; set => iD_Negocio = value; }
        public DTO_Estado Estado { get => estado; set => estado = value; }
        public string Concepto { get => concepto; set => concepto = value; }
        public string Descripcion { get => descripcion; set => descripcion = value; }
        public decimal Saldo { get => saldo; 
                               set
            {
                if (value < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(Saldo), "El saldo no puede ser negativo.");
                }
                saldo = value;
            }
                }
        public DateTime FechaInicial { get => fechaInicial; set => fechaInicial = value; }
        public DateTime FechaModificacion { get => fechaModificacion; set => fechaModificacion = value; }


        #endregion

    }
}
