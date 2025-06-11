using System;

namespace DTO
{
    public class DTO_Cliente
    {
        #region Atributos

        private int iD_Cliente;
        private int iD_Usuario;  // Corresponde al ID de Usuario (FK)
        private DTO_Estado estado;  
        private string nombreCliente;
        private string apellidoCliente;
        private string telefonoCliente;
        private string correoCliente;

        #endregion

        #region Constructor

        public DTO_Cliente()
        {
            // Inicializamos los valores por defecto
            ID_Cliente = 0;
            ID_Usuario = 0;
            Estado = new();
            NombreCliente = string.Empty;
            ApellidoCliente = string.Empty;
            TelefonoCliente = string.Empty;
            CorreoCliente = string.Empty;
        }

        #endregion

        #region Propiedades

        public int ID_Cliente { get => iD_Cliente; set => iD_Cliente = value; }
        public int ID_Usuario { get => iD_Usuario; set => iD_Usuario = value; }
        public int ID_Estado { get => iD_Usuario; set => iD_Usuario = value; }
        public DTO_Estado Estado { get => estado; set => estado = value; }
        public string NombreCliente { get => nombreCliente; set => nombreCliente = value; }
        public string ApellidoCliente { get => apellidoCliente; set => apellidoCliente = value; }
        public string TelefonoCliente { get => telefonoCliente; set => telefonoCliente = value; }
        public string CorreoCliente { get => correoCliente; set => correoCliente = value; }

        #endregion
    }
}
