using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_Cliente
    {
        DAL_Cliente dAL_Cliente = new DAL_Cliente();
        DTO_Respuesta respuesta = new();

        public async Task<DTO_Respuesta> obtenerClientes()
        {

            return await dAL_Cliente.obtenerClientes();
        }
        public async Task<DTO_Respuesta> buscarCliente(DTO_Cliente cliente)
        {
            respuesta = await dAL_Cliente.buscarCliente(cliente);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);
            return respuesta;
        }

        public async Task<List<DTO_Cliente>> BuscarClientesAsync(DTO_SolicitudDeBusquedaDeCliente solicitud, DTO_Usuario usuario)
        {
            // Removed unnecessary assignment to 'lista'
            return await dAL_Cliente.BuscarClientesAsync(solicitud, usuario);
        }

        //No lo quite xq no se donde se usa, cree un registrar que puede hacer lo mismo

        public async Task<DTO_Respuesta> guardarCliente(DTO_Usuario usuario, DTO_Cliente cliente)
        {
            respuesta = await dAL_Cliente.guardarCliente(usuario, cliente);
            if (!respuesta.TipoRespuesta)
                throw new Exception(respuesta.Mensaje);
            return respuesta;
        }
        public async Task<DTO_Respuesta> registrarCliente(DTO_Cliente negocio)
        {
            return await dAL_Cliente.registrarCliente(negocio);
        }
        public async Task<DTO_Respuesta> actualizarCliente(DTO_Cliente negocio)
        {
            return await dAL_Cliente.actualizarCliente(negocio);
        }
    }
}
