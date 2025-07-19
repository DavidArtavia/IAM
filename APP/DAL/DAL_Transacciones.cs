using DTO;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using UTL;

namespace DAL
{
    public class DAL_Transacciones : DAL_Conexion
    {
        DTO_Respuesta respuesta = new();

        public async Task<DTO_Respuesta> registrarTransaccion(DTO_Transacciones Transaccion)
        {
            try
            {
                string query = "CORE.SP_registrarTransaccion";

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;

                    sqlcmd.Parameters.AddWithValue("@ID_Negocio", Transaccion.ID_Negocio);
                    sqlcmd.Parameters.AddWithValue("@Concepto", Transaccion.Concepto ?? string.Empty);
                    sqlcmd.Parameters.AddWithValue("@Monto", Transaccion.Monto);
                    sqlcmd.Parameters.AddWithValue("@Tipo", Transaccion.Tipo ?? string.Empty);
                    sqlcmd.Parameters.AddWithValue("@NumReferencia", Transaccion.NumReferencia ?? (object)DBNull.Value);
                    sqlcmd.Parameters.AddWithValue("@TipoNumReferencia", Transaccion.TipoNumReferencia ?? (object)DBNull.Value);

                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    this.Open();

                    using (SqlDataReader reader = await sqlcmd.ExecuteReaderAsync())
                    {
                        DTO_Transacciones transaccionRegistrada = new();

                        // 🔹 Primer result set: datos de transacción
                        if (reader.Read())
                        {
                            transaccionRegistrada.ID_Transaccion = UTL_DBHelper.ReadNullSafeInt(reader["ID_Transaccion"]);
                            transaccionRegistrada.ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]);
                            transaccionRegistrada.Estado = new DTO_Estado
                            {
                                ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]),
                                Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"]),
                                Tabla = UTL_DBHelper.ReadNullSafeString(reader["EstadoTabla"])
                            };
                            transaccionRegistrada.Concepto = UTL_DBHelper.ReadNullSafeString(reader["Concepto"]);
                            transaccionRegistrada.Monto = UTL_DBHelper.ReadNullSafeDecimal(reader["Monto"]);
                            transaccionRegistrada.Tipo = UTL_DBHelper.ReadNullSafeString(reader["Tipo"]);
                            transaccionRegistrada.NumReferencia = UTL_DBHelper.ReadNullSafeString(reader["NumReferencia"]);
                            transaccionRegistrada.TipoNumReferencia = UTL_DBHelper.ReadNullSafeString(reader["TipoNumReferencia"]);
                            transaccionRegistrada.FechaTransaccion = (DateTime)UTL_DBHelper.ReadNullSafeDateTime(reader["FechaTransaccion"]);
                        }

                        // 🔹 Segundo result set: alerta
                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = manejarRespuesta(reader);
                            }
                        }

                        respuesta.Resultado.Add(transaccionRegistrada);
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

        public async Task<DTO_Respuesta> obtenerTransaccion(DTO_Negocio negocio)
        {
            DTO_Transacciones transacciones;
            List<DTO_Transacciones> listaTransacciones = [];
            try
            {

                string query = "CORE.SP_obtenerTransacciones";


                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Negocio", SqlDbType.Int).Value = negocio.ID_Negocio;

                    // Establecer la dirección de los parámetros
                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    // Asegurarse de abrir la conexión
                    this.Open();

                    // Ejecutar el comando y obtener el lector de datos
                    using (SqlDataReader reader = await sqlcmd.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            transacciones = new();
                            transacciones.ID_Transaccion = UTL_DBHelper.ReadNullSafeInt(reader["ID_Transaccion"]);
                            transacciones.ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]);
                            transacciones.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["Estado_ID_Estado"]);
                            transacciones.Estado.Nombre = UTL_DBHelper.ReadNullSafeString(reader["NombreEstado"]);
                            transacciones.Tipo = UTL_DBHelper.ReadNullSafeString(reader["Tipo"]);
                            transacciones.Concepto = UTL_DBHelper.ReadNullSafeString(reader["Concepto"]);
                            transacciones.Monto = UTL_DBHelper.ReadNullSafeDecimal(reader["Monto"]);
                            transacciones.NumReferencia = UTL_DBHelper.ReadNullSafeString(reader["NumReferencia"]);
                            transacciones.TipoNumReferencia = UTL_DBHelper.ReadNullSafeString(reader["TipoNumReferencia"]);
                            transacciones.FechaTransaccion = (DateTime)UTL_DBHelper.ReadNullSafeDateTime(reader["FechaTransaccion"]);

                            listaTransacciones.Add(transacciones);

                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = manejarRespuesta(reader);

                            }
                        }

                        respuesta.Resultado.Add(listaTransacciones);
                    }
                    return respuesta;
                }
            }
            catch (Exception e)
            {
                this.Close();
                throw e;  // Luego se guardan las ecepciones en un log
            }
            finally
            {
                this.Close();
            }
        }

        public async Task<DTO_Respuesta> obtenerTransaccionPorCuenta(DTO_Cuenta cuenta)
        {
            DTO_Transacciones transacciones;
            List<DTO_Transacciones> listaTransacciones = [];
            DTO_Respuesta respuesta = new DTO_Respuesta();
            try
            {
                string query = "CORE.SP_obtenerTransaccionesPorCuenta";

                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@CuentaId", SqlDbType.VarChar).Value = cuenta.ID_Cuenta.ToString();

                    foreach (SqlParameter param in sqlcmd.Parameters)
                        param.Direction = ParameterDirection.Input;

                    this.Open();

                    using (SqlDataReader reader = await sqlcmd.ExecuteReaderAsync())
                    {

                        do
                        {
                            var columnas = Enumerable.Range(0, reader.FieldCount)
                                .Select(i => reader.GetName(i))
                                .ToList();

                            if (columnas.Contains("ID_Transaccion") && columnas.Contains("Concepto"))
                            {
                                while (reader.Read())
                                {
                                    transacciones = new DTO_Transacciones
                                    {
                                        ID_Transaccion = UTL_DBHelper.ReadNullSafeInt(reader["ID_Transaccion"]),
                                        ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]),
                                        Estado = new()
                                        {
                                            ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["Estado_ID_Estado"]),
                                            Nombre = UTL_DBHelper.ReadNullSafeString(reader["NombreEstado"])
                                        },
                                        Tipo = UTL_DBHelper.ReadNullSafeString(reader["Tipo"]),
                                        Concepto = UTL_DBHelper.ReadNullSafeString(reader["Concepto"]),
                                        Monto = UTL_DBHelper.ReadNullSafeDecimal(reader["Monto"]),
                                        NumReferencia = UTL_DBHelper.ReadNullSafeString(reader["NumReferencia"]),
                                        TipoNumReferencia = UTL_DBHelper.ReadNullSafeString(reader["TipoNumReferencia"]),
                                        FechaTransaccion = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaTransaccion"]) ?? DateTime.MinValue
                                    };

                                    listaTransacciones.Add(transacciones);
                                }

                            }
                            else if (columnas.Contains("COD_ALERTA") && columnas.Contains("Mensaje"))
                            {
                                while (reader.Read())
                                {
                                    respuesta = manejarRespuesta(reader);
                                }
                            }

                        } while (await reader.NextResultAsync());

                        respuesta.Resultado.Add(listaTransacciones);
                    }

                    return respuesta;
                }
            }
            catch (Exception ex)
            {
                this.Close();
                System.Diagnostics.Debug.WriteLine($"❌ Error en API: {ex.Message}");
                throw;
            }
            finally
            {
                this.Close();
            }
        }

        public async Task<DTO_Respuesta> actualizarTransaccion(DTO_Transacciones transaccion)
        {
            try
            {
                string query = "CORE.SP_actualizarTransaccion";


                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;

                    sqlcmd.Parameters.Add("@ID_Transaccion", SqlDbType.Int).Value = transaccion.ID_Transaccion;
                    sqlcmd.Parameters.Add("@ID_Estado", SqlDbType.Int).Value = transaccion.Estado.ID_Estado;
                    sqlcmd.Parameters.Add("@Concepto", SqlDbType.VarChar).Value = transaccion.Concepto;
                    sqlcmd.Parameters.Add("@Monto", SqlDbType.Decimal).Value = transaccion.Monto;
                    sqlcmd.Parameters.Add("@Tipo", SqlDbType.VarChar).Value = transaccion.Tipo;
                    sqlcmd.Parameters.Add("@NumReferencia", SqlDbType.VarChar).Value = transaccion.NumReferencia;
                    sqlcmd.Parameters.Add("@TipoNumReferencia", SqlDbType.VarChar).Value = transaccion.TipoNumReferencia;

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
