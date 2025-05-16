using System;

namespace DTO
{
    public class DTO_Contexto
    {
        #region Atributos

        private int id_Contexto;
        private string nombre;
        private string tipo;
        private string prompt;

        #endregion

        #region Constructor

        public DTO_Contexto()
        {
            // Inicializamos los valores por defecto
            ID_Contexto = 0;
            Nombre = string.Empty;
            Tipo = string.Empty;
            Prompt = string.Empty;
        }

        #endregion

        #region Propiedades

        public int ID_Contexto { get => id_Contexto; set => id_Contexto = value; }
        public string Nombre { get => nombre; set => nombre = value; }
        public string Tipo { get => tipo; set => tipo = value; }
        public string Prompt { get => prompt; set => prompt = value; }

        #endregion
    }
}
