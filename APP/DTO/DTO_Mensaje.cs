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


        public int ID_Mensaje { get => id_Mensaje; set => id_Mensaje = value; }
        public int ID_ChatIA { get => id_ChatIA; set => id_ChatIA = value; }
        public string Tipo { get => tipo; set => tipo = value; }
        public string TextoMensaje { get => textoMensaje; set => textoMensaje = value; }
        public string TranscripcionAudio { get => transcripcionAudio; set => transcripcionAudio = value; }
        public string RutaAudio { get => rutaAudio; set => rutaAudio = value; }
        public DateTime FechaMensaje { get => fechaMensaje; set => fechaMensaje = value; }
        public IFormFile Audio { get => audio; set => audio = value; }

        #endregion
    }
}
