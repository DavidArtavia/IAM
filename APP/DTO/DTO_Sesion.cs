using System;

namespace DTO
{
    public class DTO_Sesion
    {
        #region Atributos

        private int id_Sesion;
        private int id_Usuario;
        private string refreshToken;
        private DateTime fechaCreacion;
        private DateTime fechaExpiracion;
        private bool revocado;
        private DateTime? fechaRevocado;
        private string? reemplazadoPorToken;
        private string userAgent;
        private string ipUsuario;

        #endregion

        #region Constructor

        public DTO_Sesion()
        {
            // Inicializamos valores por defecto
            ID_Sesion = 0;
            ID_Usuario = 0;
            RefreshToken = string.Empty;
            FechaCreacion = DateTime.Now;
            FechaExpiracion = DateTime.Now;
            Revocado = false;
            FechaRevocado = null;
            ReemplazadoPorToken = null;
            UserAgent = string.Empty;
            IPUsuario = string.Empty;
        }

        #endregion

        #region Propiedades

        public int ID_Sesion { get => id_Sesion; set => id_Sesion = value; }
        public int ID_Usuario { get => id_Usuario; set => id_Usuario = value; }
        public string RefreshToken { get => refreshToken; set => refreshToken = value; }
        public DateTime FechaCreacion { get => fechaCreacion; set => fechaCreacion = value; }
        public DateTime FechaExpiracion { get => fechaExpiracion; set => fechaExpiracion = value; }
        public bool Revocado { get => revocado; set => revocado = value; }
        public DateTime? FechaRevocado { get => fechaRevocado; set => fechaRevocado = value; }
        public string? ReemplazadoPorToken { get => reemplazadoPorToken; set => reemplazadoPorToken = value; }
        public string UserAgent { get => userAgent; set => userAgent = value; }
        public string IPUsuario { get => ipUsuario; set => ipUsuario = value; }

        #endregion
    }
}
