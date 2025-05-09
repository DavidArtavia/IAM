using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO
{
    public class DTO_Rol
    {
        #region Atributos

        private int id_Rol;
        private string nombreRol;
        private string descripcionRol;

        #endregion

        #region Constructor

        public DTO_Rol()
        {
            // Inicializamos valores por defecto
            ID_Rol = 0;
            NombreRol = string.Empty;
            DescripcionRol = string.Empty;
        }

        #endregion

        #region Propiedades

        public int ID_Rol { get => id_Rol; set => id_Rol = value; }
        public string NombreRol { get => nombreRol; set => nombreRol = value; }
        public string DescripcionRol { get => descripcionRol; set => descripcionRol = value; }

        #endregion
    }
}
