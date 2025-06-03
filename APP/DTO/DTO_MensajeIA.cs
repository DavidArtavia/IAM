namespace DTO
{
    public class DTO_MensajeIA
    {
        #region Atributos
        private string envia; // puede ser IAM, USUARIO, BAKEND
        private string recibe;
        private Object contenido;
        private List<DTO_Param> parametros;

        #endregion

        #region Constructor

        public DTO_MensajeIA()
        {
            // Inicializamos los valores por defecto
            Envia = string.Empty;
            Recibe = string.Empty;
            Contenido = new Object();
            Parametros = new List<DTO_Param>();
        }

        #endregion

        #region Propiedades

        public string Envia { get => envia; set => envia = value; }
        public object Contenido { get => contenido; set => contenido = value; }
        public string Recibe { get => recibe; set => recibe = value; }
        public List<DTO_Param> Parametros { get => parametros; set => parametros = value; }


        #endregion
    }
}
