using System;

namespace DTO
{
    public class DTO_Negocio
    {
        #region Atributos

        private int id_Negocio;
        private int id_Usuario;  
        private DTO_Estado estado; 
        private string nombreNegocio;
        private string descripcion;
        private string direccion;
        private string telefonoNegocio;
        private string correoNegocio;
        private DateTime fechaRegistro;
        private string referenciaJSON;

        #endregion

        #region Constructor

        public DTO_Negocio()
        {
            // Inicializamos los valores por defecto
            ID_Negocio = 0;
            ID_Usuario = 0;
            Estado = new DTO_Estado();
            NombreNegocio = string.Empty;
            Descripcion = string.Empty;
            Direccion = string.Empty;
            TelefonoNegocio = string.Empty;
            CorreoNegocio = string.Empty;
            FechaRegistro = DateTime.Now;
            ReferenciaJSON = string.Empty;
        }

        #endregion

        #region Propiedades

        public int ID_Negocio { get => id_Negocio; set => id_Negocio = value; }
        public int ID_Usuario { get => id_Usuario; set => id_Usuario = value; }
        public string NombreNegocio { get => nombreNegocio; set => nombreNegocio = value; }
        public string Descripcion { get => descripcion; set => descripcion = value; }
        public string Direccion { get => direccion; set => direccion = value; }
        public string TelefonoNegocio { get => telefonoNegocio; set => telefonoNegocio = value; }
        public string CorreoNegocio { get => correoNegocio; set => correoNegocio = value; }
        public DateTime FechaRegistro { get => fechaRegistro; set => fechaRegistro = value; }
        public string ReferenciaJSON { get => referenciaJSON; set => referenciaJSON = value; }
        public DTO_Estado Estado { get => estado; set => estado = value; }

        #endregion
    }
}
