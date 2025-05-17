using System;

namespace DTO
{
    public class DTO_Cliente
    {
        #region Atributos

        private int id_Cliente;
        private int id_Usuario;  // Corresponde al ID de Usuario (FK)
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
            NombreCliente = string.Empty;
            ApellidoCliente = string.Empty;
            TelefonoCliente = string.Empty;
            CorreoCliente = string.Empty;
        }

        #endregion

        #region Propiedades

        public int ID_Cliente { get => id_Cliente; set => id_Cliente = value; }
        public int ID_Usuario { get => id_Usuario; set => id_Usuario = value; }
        public string NombreCliente { get => nombreCliente; set => nombreCliente = value; }
        public string ApellidoCliente { get => apellidoCliente; set => apellidoCliente = value; }
        public string TelefonoCliente { get => telefonoCliente; set => telefonoCliente = value; }
        public string CorreoCliente { get => correoCliente; set => correoCliente = value; }

        #endregion
    }
}
