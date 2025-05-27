using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO
{
    public class DTO_OrdenServicio
    {
        #region Atributos
        private int iD_OrdenServicio;
        private int iD_Cliente;
        private int iD_Negocio;
        private DTO_Estado estado;
        private DateTime fechaEstimadaEntrega;
        private DateTime fechaInicio;
        private DateTime fechaFinal;
        private DateTime fechaEntrega;
        private string notaOrdenServicio;
        private List<DTO_Param> referenciaJSON;
        #endregion


        #region Constructor
        public DTO_OrdenServicio()
        {
            ID_OrdenServicio = 0;
            ID_Cliente = 0;
            ID_Negocio = 0;
            Estado = new();
            FechaEstimadaEntrega = DateTime.Now;
            FechaInicio = DateTime.Now;
            FechaFinal = DateTime.Now;
            FechaEntrega = DateTime.Now;
            NotaOrdenServicio = string.Empty;
            ReferenciaJSON = [];
        }
        #endregion

        #region Set´s y Get's
        public int ID_OrdenServicio { get => iD_OrdenServicio; set => iD_OrdenServicio = value; }
        public int ID_Cliente { get => iD_Cliente; set => iD_Cliente = value; }
        public int ID_Negocio { get => iD_Negocio; set => iD_Negocio = value; }
        public DTO_Estado Estado { get => estado; set => estado = value; }
        public DateTime FechaEstimadaEntrega { get => fechaEstimadaEntrega; set => fechaEstimadaEntrega = value; }
        public DateTime FechaInicio { get => fechaInicio; set => fechaInicio = value; }
        public DateTime FechaFinal { get => fechaFinal; set => fechaFinal = value; }
        public DateTime FechaEntrega { get => fechaEntrega; set => fechaEntrega = value; }
        public string NotaOrdenServicio { get => notaOrdenServicio; set => notaOrdenServicio = value; }
        public List<DTO_Param> ReferenciaJSON
        {
            get => referenciaJSON; set => referenciaJSON = value;
        }
        #endregion
    }
}
