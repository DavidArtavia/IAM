using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO
{
    public class DTO_Respuesta
    {
        #region Atributos

        private bool tipoRespuesta;
        private String mensaje;
        private String codigo;
        private String tipo;
        private List<object> resultado;


        #endregion

        #region Constructor

        public DTO_Respuesta()
        {
            TipoRespuesta = false;
            Mensaje = String.Empty;
            Codigo = String.Empty;
            Resultado = new List<object>();
            Tipo = String.Empty;    
        }


        #endregion

        #region Set´s y Get's


        public bool TipoRespuesta { get => tipoRespuesta; set => tipoRespuesta = value; }
        public string Mensaje { get => mensaje; set => mensaje = value; }
        public List<object> Resultado { get => resultado; set => resultado = value; }
        public string Codigo { get => codigo; set => codigo = value; }
        public string Tipo { get => tipo; set => tipo = value; }


        #endregion
    }
}
