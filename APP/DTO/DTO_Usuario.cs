using System;

namespace DTO
{
    public class DTO_Usuario
    {
        #region Atributos

        private int iD_Usuario;
        private DTO_Estado estado;
        private String nombreUsuario;
        private String apellido;
        private String telefonoUsuario;
        private String correoUsuario;
        private String pass;
        private DTO_Rol rol;

        #endregion


        #region Constructor

        public DTO_Usuario()
        {

            ID_Usuario = 0;
            NombreUsuario = String.Empty;
            Apellido = String.Empty;
            TelefonoUsuario = String.Empty;
            CorreoUsuario = String.Empty;
            CorreoUsuario = String.Empty;
            Pass = String.Empty;
            Estado = new DTO_Estado();
            Rol = new DTO_Rol();

        }

        #endregion

        #region Set´s y Get's

        public int ID_Usuario { get => iD_Usuario; set => iD_Usuario = value; }
        public string NombreUsuario { get => nombreUsuario; set => nombreUsuario = value; }
        public string Apellido { get => apellido; set => apellido = value; }
        public string TelefonoUsuario { get => telefonoUsuario; set => telefonoUsuario = value; }
        public string CorreoUsuario { get => correoUsuario; set => correoUsuario = value; }
        public string Pass { get => pass; set => pass = value; }
        public DTO_Estado Estado { get => estado; set => estado = value; }
        public DTO_Rol Rol { get => rol; set => rol = value; }


        #endregion
    }
}
