using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace DTO
{
    public class DTO_Mensaje
    {
        #region Atributos
        private int id_Mensaje;
        private int id_ChatIA;
        private string envia; // puede ser IAM, USUARIO, BAKEND
        private string recibe;
        private string contenido;
        private List<DTO_Param> parametros;
        private string rutaAudio; 
        private DateTime fechaMensaje;
        private IFormFile audio; //Cuando venga del código toca enviar en este campo el binario del audio en formato WAV

        #endregion

        #region Constructor

        public DTO_Mensaje()
        {
            Envia = string.Empty;
            Recibe = string.Empty;
            Contenido = string.Empty;
            Parametros = new List<DTO_Param>();
            ID_Mensaje = 0;
            ID_ChatIA = 0;
            RutaAudio = string.Empty;
            FechaMensaje = DateTime.Now;
        }

        #endregion

        #region Propiedades

        public string Envia { get => envia; set => envia = value; }
        public string Contenido { get => contenido; set => contenido = value; }
        public string Recibe { get => recibe; set => recibe = value; }
        public List<DTO_Param> Parametros { get => parametros; set => parametros = value; }
        [JsonIgnore]
        public int ID_Mensaje { get => id_Mensaje; set => id_Mensaje = value; }
        [JsonIgnore]
        public int ID_ChatIA { get => id_ChatIA; set => id_ChatIA = value; }
        [JsonIgnore]
        public string RutaAudio { get => rutaAudio; set => rutaAudio = value; }
        [JsonIgnore]
        public DateTime FechaMensaje { get => fechaMensaje; set => fechaMensaje = value; }
        [JsonIgnore]
        public IFormFile Audio { get => audio; set => audio = value; }

        #endregion
    }
}
