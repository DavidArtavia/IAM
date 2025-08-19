using DAL;
using DTO;

namespace BLL
{
    public class BLL_Proforma
    {
        private readonly DAL_Proforma dal = new();

        public async Task<DTO_Respuesta> RegistrarProforma(DTO_Proforma p)
            => await dal.RegistrarProforma(p);

        public async Task<DTO_Respuesta> ActualizarProforma(DTO_Proforma p)
            => await dal.ActualizarProforma(p);

        public async Task<DTO_Respuesta> ObtenerProformas(DTO_Proforma proforma)
            => await dal.ObtenerProformas(proforma);

        public async Task<DTO_Respuesta> RegistrarItemsProforma(DTO_ProformaItem item)
            => await dal.RegistrarItemsProforma(item);

        public async Task<DTO_Respuesta> ActualizarItemsProforma(DTO_ProformaItem item)
            => await dal.ActualizarItemsProforma(item);

        public async Task<DTO_Respuesta> ObtenerItemsProforma(DTO_Proforma proforma)
            => await dal.ObtenerItemsProforma(proforma);
    }
}
