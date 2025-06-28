using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO
{
    public class DTO_Transacciones
    {
        #region Atributos

        private int id_Transaccion;
        private int id_Negocio;
        private DTO_Estado estado;
        private string concepto;
        private decimal monto;
        private string tipo;
        private string numReferencia;
        private string tipoNumReferencia;
        private DateTime fechaTransaccion;

        #endregion

        #region Constructor

        public DTO_Transacciones()
        {
            ID_Transaccion = 0;
            ID_Negocio = 0;
            Estado = new DTO_Estado();
            Concepto = string.Empty;
            Monto = 0;
            Tipo = string.Empty;
            NumReferencia = string.Empty;
            TipoNumReferencia = string.Empty;
            FechaTransaccion = DateTime.Now;

        }

        #endregion

        #region Set´s y Get's
        public int ID_Transaccion { get => id_Transaccion; set => id_Transaccion = value; }
        public int ID_Negocio { get => id_Negocio; set => id_Negocio = value; }
        public DTO_Estado Estado { get => estado; set => estado = value; }
        public string Concepto { get => concepto; set => concepto = value; }
        public decimal Monto { get => monto; set => monto = value; }
        public string Tipo { get => tipo; set => tipo = value; }
        public string NumReferencia { get => numReferencia; set => numReferencia = value; }
        public string TipoNumReferencia { get => tipoNumReferencia; set => tipoNumReferencia = value; }
        public DateTime FechaTransaccion { get => fechaTransaccion; set => fechaTransaccion = value; }

        #endregion 


    }
}
