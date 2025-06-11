using DTO;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using UTL;

namespace DAL
{
    public class DAL_OrdenServicio : DAL_Conexion
    {

        DTO_Respuesta respuesta = new();

        public async Task<DTO_Respuesta> registrarOrdenServicio(DTO_OrdenServicio ordenServicio)
        {
            try
            {
                string query = "CORE.SP_registrarOrdenServicio";
                string json = System.Text.Json.JsonSerializer.Serialize(ordenServicio.ReferenciaJSON);

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = System.Data.CommandType.StoredProcedure;
                    sqlcmd.Parameters.AddWithValue("@ID_Cliente", ordenServicio.ID_Cliente);
                    sqlcmd.Parameters.AddWithValue("@ID_Negocio", ordenServicio.ID_Negocio);
                    sqlcmd.Parameters.AddWithValue("@FechaEstimadaEntrega", ordenServicio.FechaEstimadaEntrega);
                    sqlcmd.Parameters.AddWithValue("@FechaInicio", ordenServicio.FechaInicio);
                    sqlcmd.Parameters.AddWithValue("@FechaFinal", ordenServicio.FechaFinal);
                    sqlcmd.Parameters.AddWithValue("@FechaEntrega", ordenServicio.FechaEntrega);
                    sqlcmd.Parameters.AddWithValue("@NotaOrdenServicio", ordenServicio.NotaOrdenServicio);
                    sqlcmd.Parameters.Add("@ReferenciaJSON", SqlDbType.NVarChar, -1).Value = json;

                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    this.Open();

                    using (SqlDataReader reader = await sqlcmd.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            ordenServicio.ID_OrdenServicio = UTL_DBHelper.ReadNullSafeInt(reader["ID_OrdenServicio"]);
                            ordenServicio.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]);
                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = manejarRespuesta(reader);
                            }
                        }
                    }

                    respuesta.Resultado.Add(ordenServicio);
                    return respuesta;
                }
            }
            catch (Exception e)
            {
                this.Close();
                throw e;
            }
            finally
            {
                this.Close();
            }
        }

        public DTO_Respuesta obtenerOrdenDeServicio(DTO_Negocio negocio)
        {
            var listaOrdenes = new List<DTO_OrdenServicio>();
            var respuesta = new DTO_Respuesta();       

            try
            {
                using (var sqlcmd = new SqlCommand("CORE.SP_obtenerOrdenesServicioPorNegocio", this.GetObjConexion()))
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
                                // manejarRespuesta debería rellenar tipoRespuesta, mensaje y código
                                respuesta = manejarRespuesta(reader);
                            }
                        }
                    }

                    // ——— Asignar las órdenes **individualmente** al Resultado ———
                    // Si Resultado es List<DTO_OrdenServicio>:
                    // respuesta.Resultado = listaOrdenes;

                    // Si Resultado es List<object> o List<dynamic>, haz:
                    foreach (var o in listaOrdenes)
                        respuesta.Resultado.Add(o);

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


        public async Task<DTO_Respuesta> actualizarOrdenServicio(DTO_OrdenServicio ordenServicio)
        {
            try
            {
                string query = "CORE.SP_actualizarOrdenServicio";
                string json = System.Text.Json.JsonSerializer.Serialize(ordenServicio.ReferenciaJSON);


                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;

                    sqlcmd.Parameters.Add("@ID_OrdenServicio", SqlDbType.Int).Value = ordenServicio.ID_OrdenServicio;
                    sqlcmd.Parameters.Add("@ID_Estado", SqlDbType.Int).Value = ordenServicio.Estado.ID_Estado;
                    sqlcmd.Parameters.Add("@FechaEstimadaEntrega", SqlDbType.DateTime).Value = ordenServicio.FechaEstimadaEntrega;
                    sqlcmd.Parameters.Add("@FechaInicio", SqlDbType.DateTime).Value = ordenServicio.FechaInicio;
                    sqlcmd.Parameters.Add("@FechaFinal", SqlDbType.DateTime).Value = ordenServicio.FechaFinal;
                    sqlcmd.Parameters.Add("@FechaEntrega", SqlDbType.DateTime).Value = ordenServicio.FechaEntrega;
                    sqlcmd.Parameters.Add("@ReferenciaJSON", SqlDbType.NVarChar, -1).Value = json;
                    sqlcmd.Parameters.Add("@NotaOrdenServicio", SqlDbType.VarChar).Value = ordenServicio.NotaOrdenServicio;

                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    this.Open();

                    using (SqlDataReader reader = await sqlcmd.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            respuesta = manejarRespuesta(reader);
                        }
                    }

                    if (respuesta.TipoRespuesta)
                    {
                        respuesta.Resultado.Add(ordenServicio);
                    }
                    return respuesta;
                }
            }
            catch (Exception e)
            {
                this.Close();
                throw e;
            }
            finally
            {
                this.Close();
            }
        }
        public async Task<DTO_Respuesta> buscarOrdenServicio(DTO_OrdenServicio ordenServicio, DTO_Cliente cliente)
        {
            try
            {
                string query = "CORE.SP_buscarOrdenServicio";
                string json = System.Text.Json.JsonSerializer.Serialize(ordenServicio.ReferenciaJSON);
                List<DTO_OrdenServicio> listaOrdenServicio = new();

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                        
                    sqlcmd.Parameters.Add("@ID_OrdenServicio", SqlDbType.Int).Value = (ordenServicio.ID_OrdenServicio == 0) ? (object)DBNull.Value : ordenServicio.ID_OrdenServicio;
                    sqlcmd.Parameters.Add("@ID_Negocio", SqlDbType.Int).Value = ordenServicio.ID_Negocio;
                    sqlcmd.Parameters.Add("@ApellidoCliente", SqlDbType.VarChar).Value = (cliente.ApellidoCliente == string.Empty) ? (object)DBNull.Value : cliente.ApellidoCliente;
                    sqlcmd.Parameters.Add("@NombreCliente", SqlDbType.VarChar).Value = (cliente.NombreCliente == string.Empty) ? (object)DBNull.Value : cliente.NombreCliente;
                    sqlcmd.Parameters.Add("@CorreoCliente", SqlDbType.NVarChar).Value = (cliente.CorreoCliente == string.Empty) ? (object)DBNull.Value : cliente.CorreoCliente;
                    sqlcmd.Parameters.Add("@TelefonoCliente", SqlDbType.VarChar).Value = (cliente.TelefonoCliente == string.Empty) ? (object)DBNull.Value : cliente.TelefonoCliente;
                    sqlcmd.Parameters.Add("@ReferenciaJSON", SqlDbType.NVarChar, -1).Value = json;

                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    this.Open();

                    using (SqlDataReader reader = await sqlcmd.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            ordenServicio = new();
                            ordenServicio.ReferenciaJSON = (System.Text.Json.JsonSerializer.Deserialize<List<DTO_Param>>(UTL_DBHelper.ReadNullSafeString(reader["ReferenciaJSON"]))) ?? new List<DTO_Param>();
                            ordenServicio.ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]);
                            ordenServicio.ID_OrdenServicio = UTL_DBHelper.ReadNullSafeInt(reader["ID_OrdenServicio"]);
                            ordenServicio.ID_Cliente = UTL_DBHelper.ReadNullSafeInt(reader["ID_Cliente"]);
                            ordenServicio.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]);
                            ordenServicio.Estado.Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"]);
                            ordenServicio.FechaOrdenServicio = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaOrdenServicio"], null);
                            ordenServicio.FechaEstimadaEntrega = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaEstimadaEntrega"], null);
                            ordenServicio.FechaInicio = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaInicio"], null);
                            ordenServicio.FechaFinal = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaFinal"], null);
                            ordenServicio.FechaEntrega = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaEntrega"], null);
                            ordenServicio.NotaOrdenServicio = UTL_DBHelper.ReadNullSafeString(reader["NotaOrdenServicio"]);
                            
                           /* cliente = new DTO_Cliente();
                            cliente.ID_Cliente = UTL_DBHelper.ReadNullSafeInt(reader["ID_Cliente"]);
                            cliente.ID_Usuario = UTL_DBHelper.ReadNullSafeInt(reader["ID_Usuario"]);
                            cliente.NombreCliente = UTL_DBHelper.ReadNullSafeString(reader["NombreCliente"]);
                            cliente.ApellidoCliente = UTL_DBHelper.ReadNullSafeString(reader["ApellidoCliente"]);
                            cliente.TelefonoCliente = UTL_DBHelper.ReadNullSafeString(reader["TelefonoCliente"]);
                            cliente.CorreoCliente = UTL_DBHelper.ReadNullSafeString(reader["CorreoCliente"]);
                           */

                            listaOrdenServicio.Add(ordenServicio);
                        }


                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = manejarRespuesta(reader);

                            }
                        }
                    }

                    respuesta.Resultado.Add(listaOrdenServicio);
                    return respuesta;
                }
            }
            catch (Exception e)
            {
                this.Close();
                throw e;
            }
            finally
            {
                this.Close();
            }
        }
    }
}
