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
    public  class DAL_ItemOrdenServicio : DAL_Conexion
    {
        DTO_Respuesta respuesta = new();
        public async Task<DTO_Respuesta> guardarItemOrdenServicio(DTO_ItemOrdenServicio itemOrdenServicio)
        {
            try
            {
                string query = "CORE.SP_guardarItemOrdenDeServicio";

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = System.Data.CommandType.StoredProcedure;
                    sqlcmd.Parameters.AddWithValue("@ID_OrdenServicio", itemOrdenServicio.ID_OrdenServicio);
                    sqlcmd.Parameters.AddWithValue("@NombreItemOrdenServicio", itemOrdenServicio.NombreItemOrdenServicio);
                    sqlcmd.Parameters.AddWithValue("@Descripcion", itemOrdenServicio.Descripcion);
                    sqlcmd.Parameters.AddWithValue("@Monto", itemOrdenServicio.Monto);
                    sqlcmd.Parameters.AddWithValue("@Avance", itemOrdenServicio.Avance);



                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    this.Open();

                    using (SqlDataReader reader = await sqlcmd.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            itemOrdenServicio.ID_ItemOrdenServicio = UTL_DBHelper.ReadNullSafeInt(reader["ID_ItemOrdenServicio"]);
                            itemOrdenServicio.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]);
                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = manejarRespuesta(reader);
                            }
                        }
                    }

                    respuesta.Resultado.Add(itemOrdenServicio);
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

        public async Task<DTO_Respuesta> actualizarItemOrdenServicio(DTO_ItemOrdenServicio itemOrdenServicio)
        {
            try
            {
                string query = "CORE.SP_actualizarItemOrdenDeServicio";

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = System.Data.CommandType.StoredProcedure;
                    sqlcmd.Parameters.AddWithValue("@ID_ItemOrdenServicio", itemOrdenServicio.ID_ItemOrdenServicio);
                    sqlcmd.Parameters.AddWithValue("@ID_Estado", itemOrdenServicio.Estado.ID_Estado);
                    sqlcmd.Parameters.AddWithValue("@NombreItemOrdenServicio", itemOrdenServicio.NombreItemOrdenServicio);
                    sqlcmd.Parameters.AddWithValue("@Descripcion", itemOrdenServicio.Descripcion);
                    sqlcmd.Parameters.AddWithValue("@Monto", itemOrdenServicio.Monto);
                    sqlcmd.Parameters.AddWithValue("@Avance", itemOrdenServicio.Avance);



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

        public async Task<DTO_Respuesta> obtenerItemOrdenServicio(DTO_ItemOrdenServicio itemOrdenServicio)
        {
            try
            {
                string query = "CORE.SP_obtenerItemOrdenDeServicio";
                List<DTO_ItemOrdenServicio> lista = new();

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = System.Data.CommandType.StoredProcedure;
                    sqlcmd.Parameters.AddWithValue("@ID_OrdenServicio", itemOrdenServicio.ID_OrdenServicio);



                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    this.Open();

                    using (var reader = await sqlcmd.ExecuteReaderAsync())
                    {
                        // ——— Primer result set: órdenes de servicio ———
                        while (reader.Read())
                        {
                            itemOrdenServicio = new DTO_ItemOrdenServicio
                            {
                                ID_ItemOrdenServicio = UTL_DBHelper.ReadNullSafeInt(reader["ID_ItemOrdenServicio"]),
                                ID_OrdenServicio = UTL_DBHelper.ReadNullSafeInt(reader["ID_OrdenServicio"]),
                                NombreItemOrdenServicio = UTL_DBHelper.ReadNullSafeString(reader["NombreItemOrdenServicio"]),
                                Estado = new DTO_Estado
                                {
                                    ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]),
                                    Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"])
                                },
                                Descripcion = UTL_DBHelper.ReadNullSafeString(reader["Descripcion"]),
                                Monto = UTL_DBHelper.ReadNullSafeDecimal(reader["Monto"]),
                                Avance = UTL_DBHelper.ReadNullSafeInt(reader["Avance"])
                            };

                            lista.Add(itemOrdenServicio);
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

                    respuesta.Resultado.Add(lista);
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
