namespace DTO
{
    public class DTO_RepuestaIA
    {
        #region Atributos

        private string respuestaUsuario;
        private string intencionDetectada;
        private List<DTO_Param> paramsAccion;
        private List<DTO_Param> paramsIntencion;
        private string accionBakendDetectada;
        private bool ejecutarAccionBakend;
        private bool ejecutarIntencionDetectada;

        #endregion

        #region Constructor

        public DTO_RepuestaIA()
        {
            // Inicializamos los valores por defecto
            RespuestaUsuario = string.Empty;
            IntencionDetectada = string.Empty;
            ParamsAccion = new List<DTO_Param>();
            ParamsIntencion = new List<DTO_Param>();
            AccionBakendDetectada = string.Empty;
            EjecutarAccionBakend = false;
            EjecutarIntencionDetectada = false;
        }

        #endregion

        #region Propiedades


        public string RespuestaUsuario { get => respuestaUsuario; set => respuestaUsuario = value; }
        public string IntencionDetectada { get => intencionDetectada; set => intencionDetectada = value; }
        public List<DTO_Param> ParamsAccion { get => paramsAccion; set => paramsAccion = value; }
        public List<DTO_Param> ParamsIntencion { get => paramsIntencion; set => paramsIntencion = value; }
        public string AccionBakendDetectada { get => accionBakendDetectada; set => accionBakendDetectada = value; }
        public bool EjecutarAccionBakend { get => ejecutarAccionBakend; set => ejecutarAccionBakend = value; }
        public bool EjecutarIntencionDetectada { get => ejecutarIntencionDetectada; set => ejecutarIntencionDetectada = value; }
       

        #endregion
    }
}
