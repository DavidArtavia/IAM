using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;
using System;
using System.ComponentModel.DataAnnotations;

namespace DTO
{
    public class DTO_Mensaje
    {
        #region Atributos

        private int id_Mensaje;
        private int id_ChatIA; 
        private string tipo;
        private string textoMensaje;
        private string transcripcionAudio;
        private string rutaAudio; 
        private DateTime fechaMensaje;
        private IFormFile audio; //Cuando venga del código toca enviar en este campo el binario del audio en formato WAV

        #endregion

        #region Constructor

        public DTO_Mensaje()
        {

            ID_Mensaje = 0;
            ID_ChatIA = 0;
            Tipo = string.Empty;
            TextoMensaje = string.Empty;
            TranscripcionAudio = string.Empty;
            RutaAudio = string.Empty;
            FechaMensaje = DateTime.Now;

        }

        #endregion

        #region Propiedades


        [SwaggerSchema(Description = "opcional")]
        public int ID_Mensaje { get => id_Mensaje; set => id_Mensaje = value; }
        [SwaggerSchema(Description = "opcional")]
        public int ID_ChatIA { get => id_ChatIA; set => id_ChatIA = value; }
        [SwaggerSchema(Description = "opcional")]
        public string Tipo { get => tipo; set => tipo = value; }
        [SwaggerSchema(Description = "opcional")]
        public string TextoMensaje { get => textoMensaje; set => textoMensaje = value; }
        [SwaggerSchema(Description = "opcional")]
        public string TranscripcionAudio { get => transcripcionAudio; set => transcripcionAudio = value; }
        [SwaggerSchema(Description = "opcional")]
        public string RutaAudio { get => rutaAudio; set => rutaAudio = value; }
        [SwaggerSchema(Description = "opcional")]
        public DateTime FechaMensaje { get => fechaMensaje; set => fechaMensaje = value; }
        [SwaggerSchema(Description = "opcional")]
        public IFormFile Audio { get => audio; set => audio = value; }

        #endregion
    }
}
