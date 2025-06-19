using DTO;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UTL;

namespace DAL
{
    public class DAL_Monitor: DAL_Conexion
    {
        public DTO_Respuesta cargarMonitorOrdenServicio(DTO_Negocio negocio)
        {
            List<DTO_OrdenServicio> listaOrdenes = new();
            List<DTO_ItemOrdenServicio> listaItems = new();
            DTO_Respuesta respuesta = new();

            try
            {
                using (var sqlcmd = new SqlCommand("CORE.SP_cargarMonitorOrdenServicio", this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Negocio", SqlDbType.Int).Value = negocio.ID_Negocio;
                    this.Open();

                    using (var reader = sqlcmd.ExecuteReader())
                    {
                        // ——— Primer result set: órdenes de servicio ———
                        while (reader.Read())
                        {
                            var orden = new DTO_OrdenServicio
                            {
                                ID_OrdenServicio = UTL_DBHelper.ReadNullSafeInt(reader["ID_OrdenServicio"]),
                                ID_Cliente = UTL_DBHelper.ReadNullSafeInt(reader["ID_Cliente"]),
                                ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]),
                                Estado = new DTO_Estado
                                {
                                    ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]),
                                    Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"])
                                },
                                FechaOrdenServicio = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaOrdenServicio"]),
                                FechaEstimadaEntrega = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaEstimadaEntrega"]),
                                FechaInicio = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaInicio"]),
                                FechaFinal = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaFinal"]),
                                FechaEntrega = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaEntrega"]),
                                NotaOrdenServicio = UTL_DBHelper.ReadNullSafeString(reader["NotaOrdenConCliente"]),
                            };

                            // parse del JSON de referencia
                            var jsonRef = UTL_DBHelper.ReadNullSafeString(reader["ReferenciaJSON"]);
                            if (!string.IsNullOrWhiteSpace(jsonRef))
                            {
                                try
                                {
                                    orden.ReferenciaJSON =
                                        JsonConvert.DeserializeObject<List<DTO_Param>>(jsonRef)
                                        ?? new List<DTO_Param>();
                                }
                                catch
                                {
                                    orden.ReferenciaJSON = new List<DTO_Param>();
                                }
                            }

                            listaOrdenes.Add(orden);
                        }


                        // ——— Segundo result set: alertas ———
                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                var item = new DTO_ItemOrdenServicio
                                {
                                    ID_ItemOrdenServicio = UTL_DBHelper.ReadNullSafeInt(reader["ID_ItemOrdenServicio"]),
                                    ID_OrdenServicio = UTL_DBHelper.ReadNullSafeInt(reader["ID_OrdenServicio"]),
                                    Estado = new DTO_Estado
                                    {
                                        ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]),
                                        Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"])
                                    },
                                    NombreItemOrdenServicio = UTL_DBHelper.ReadNullSafeString(reader["NombreItemOrdenServicio"]),
                                    Descripcion = UTL_DBHelper.ReadNullSafeString(reader["Descripcion"]),
                                    Monto = UTL_DBHelper.ReadNullSafeDecimal(reader["Monto"]),
                                    Avance = UTL_DBHelper.ReadNullSafeInt(reader["Avance"]),
                                };

                                listaItems.Add(item);
                            }
                        }

                        // ——— Segundo result set: alertas ———
                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                // manejarRespuesta debería rellenar tipoRespuesta, mensaje y código
                                respuesta = manejarRespuesta(reader);
                            }
                        }
                    }

                    respuesta.Resultado.Add(listaOrdenes);
                    respuesta.Resultado.Add(listaItems);

                    return respuesta;
                }
            }
            catch (Exception ex)
            {
                // cerrar conexión, loguear, etc.
                throw;
            }
            finally
            {
                this.Close();
            }
        }
    }
}
