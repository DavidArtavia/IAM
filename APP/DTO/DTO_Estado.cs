using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO
{
    public class DTO_Estado
    {
        #region Atributos

        private int iD_Estado;
        private String nombre;
        private String tabla;

        #endregion

        #region Constructor

        public DTO_Estado()
        {

            ID_Estado = 0;
            Nombre = String.Empty;
            Tabla = String.Empty;


        }

        #endregion

        #region Set´s y Get's
        public int ID_Estado { get => iD_Estado; set => iD_Estado = value; }
        public string Nombre { get => nombre; set => nombre = value; }
        public string Tabla { get => tabla; set => tabla = value; }

        #endregion
    }
}
