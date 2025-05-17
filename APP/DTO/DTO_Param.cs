using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO
{
    public class DTO_Param
    {
        #region Atributos

        private string nombre;
        private string valor;


        public DTO_Param()
        {
            // Inicializamos los valores por defecto
            Nombre = string.Empty;
            Valor = string.Empty;
        }

        #endregion

        #region Propiedades


        public string Nombre { get => nombre; set => nombre = value; }
        public string Valor { get => valor; set => valor = value; }


        #endregion
    }
}
