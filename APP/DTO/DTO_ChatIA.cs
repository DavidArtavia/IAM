using System;

namespace DTO
{
    public class DTO_ChatIA
    {
        #region Atributos

        private int id_ChatIA;
        private int id_Negocio;  
        private DTO_Estado estado;    
        private DateTime fechaInicial;
        private DateTime? fechaFinal;
        private List<DTO_Mensaje> mensajesChat;

        #endregion

        #region Constructor

        public DTO_ChatIA()
        {
            // Inicializamos los valores por defecto
            ID_ChatIA = 0;
            ID_Negocio = 0;
            Estado = new DTO_Estado();
            FechaInicial = DateTime.Now;
            FechaFinal = null;
            MensajesChat = new List<DTO_Mensaje>();
        }

        #endregion

        #region Propiedades

        public int ID_ChatIA { get => id_ChatIA; set => id_ChatIA = value; }
        public int ID_Negocio { get => id_Negocio; set => id_Negocio = value; }
        public DTO_Estado Estado { get => estado; set => estado = value; }
        public DateTime FechaInicial { get => fechaInicial; set => fechaInicial = value; }
        public DateTime? FechaFinal { get => fechaFinal; set => fechaFinal = value; }
        public List<DTO_Mensaje> MensajesChat { get => mensajesChat; set => mensajesChat = value; }

        #endregion
    }
}
