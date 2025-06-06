namespace DTO
{
    public class DTO_FiltroEstado
    {
        #region Atributos  
        private string filtroEstado;
        #endregion

        #region Constructor
        public DTO_FiltroEstado()
        {
            filtroEstado = string.Empty;
        }
        #endregion

        #region Getters and Setters  
        public string FiltroEstado { get => filtroEstado; set => filtroEstado = value; }
        #endregion
    }
}
