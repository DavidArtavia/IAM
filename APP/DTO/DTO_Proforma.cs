using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO
{
    public class DTO_Proforma
    {
        #region Atributos
        private int iD_Proforma;
        private int iD_Negocio;
        private int iD_Cliente;
        private DTO_Estado estado;
        private DateTime? fechaProforma;
        private DateTime? fechaVencimiento;
        private string observacionProforma;
        private DateTime? fechaModificacion;
        private decimal? totalCalculado;
        #endregion

        #region Constructor
        public DTO_Proforma()
        {
            ID_Proforma = 0;
            ID_Negocio = 0;
            ID_Cliente = 0;
            Estado = new();
            FechaProforma = null;
            FechaVencimiento = null;
            ObservacionProforma = string.Empty;
            FechaModificacion = null;
            TotalCalculado = null;
        }
        #endregion

        #region Getter y Setter
        public int ID_Proforma { get => iD_Proforma; set => iD_Proforma = value; }
        public int ID_Negocio { get => iD_Negocio; set => iD_Negocio = value; }
        public int ID_Cliente { get => iD_Cliente; set => iD_Cliente = value; }
        public DTO_Estado Estado { get => estado; set => estado = value; }
        public DateTime? FechaProforma { get => fechaProforma; set => fechaProforma = value; }
        public DateTime? FechaVencimiento { get => fechaVencimiento; set => fechaVencimiento = value; }
        public string ObservacionProforma { get => observacionProforma; set => observacionProforma = value; }
        public DateTime? FechaModificacion { get => fechaModificacion; set => fechaModificacion = value; }
        public decimal? TotalCalculado { get => totalCalculado; set => totalCalculado = value; }

        #endregion
    }
}

