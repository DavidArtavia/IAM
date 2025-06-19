using System;

namespace DTO
{
    public class DTO_ItemOrdenServicio
    {
        #region Atributos

        private int id_ItemOrdenServicio;
        private int id_OrdenServicio;  // Corresponde al ID de OrdenServicio (FK)
        private DTO_Estado estado;         // Corresponde al ID de Estado (FK)
        private string nombreItemOrdenServicio;
        private string descripcion;
        private decimal monto;
        private int? avance;  // Puede ser NULL, por lo que es de tipo nullable (int?)

        #endregion

        #region Constructor

        public DTO_ItemOrdenServicio()
        {
            // Inicializamos los valores por defecto
            ID_ItemOrdenServicio = 0;
            ID_OrdenServicio = 0;
            Estado = new();
            NombreItemOrdenServicio = string.Empty;
            Descripcion = string.Empty;
            Monto = 0m;  // Valor predeterminado para DECIMAL
            Avance = null;  // Nullable, lo dejamos como null
        }

        #endregion

        #region Propiedades

        public int ID_ItemOrdenServicio { get => id_ItemOrdenServicio; set => id_ItemOrdenServicio = value; }
        public int ID_OrdenServicio { get => id_OrdenServicio; set => id_OrdenServicio = value; }
        public string NombreItemOrdenServicio { get => nombreItemOrdenServicio; set => nombreItemOrdenServicio = value; }
        public string Descripcion { get => descripcion; set => descripcion = value; }
        public decimal Monto { get => monto; set => monto = value; }
        public int? Avance { get => avance; set => avance = value; }
        public DTO_Estado Estado { get => estado; set => estado = value; }

        #endregion
    }
}
