namespace DTO
{
    public class DTO_MetricaKPI
    {
        #region Atributos

        private string tituloRegular;
        private string tituloNegrita;
        private string ordenTitulos;
        private string txtColor;
        private string bgColor;
        private string valorRegular;
        private string valorNegrita;
        private string ordenValores;
        private string icono;
        private string info;

        #endregion

        #region Constructor

        public DTO_MetricaKPI()
        {

            TituloRegular = string.Empty;
            TituloNegrita = string.Empty;
            OrdenTitulos = string.Empty;
            TXTColor = string.Empty;
            BGColor = string.Empty;
            ValorRegular = string.Empty;
            ValorNegrita = string.Empty;
            OrdenValores = string.Empty;
            Icono = string.Empty;
            Info = string.Empty;
        }

        #endregion

        #region Propiedades

        public string TituloRegular { get => tituloRegular; set => tituloRegular = value; }
        public string TituloNegrita { get => tituloNegrita; set => tituloNegrita = value; }
        public string OrdenTitulos { get => ordenTitulos; set => ordenTitulos = value; }
        public string TXTColor { get => txtColor; set => txtColor = value; }
        public string BGColor { get => bgColor; set => bgColor = value; }
        public string ValorRegular { get => valorRegular; set => valorRegular = value; }
        public string ValorNegrita { get => valorNegrita; set => valorNegrita = value; }
        public string OrdenValores { get => ordenValores; set => ordenValores = value; }
        public string Icono { get => icono; set => icono = value; }
        public string Info { get => info; set => info = value; }

        #endregion
    }
}
