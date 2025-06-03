using DTO;
using Microsoft.Data.SqlClient;
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
    public class DAL_Cuenta : DAL_Conexion
    {

        DTO_Respuesta respuesta = new();
        public DTO_Respuesta registrarCuentaPorPagar(DTO_CuentaPorPagar cuentaPorPagar)
        {
            try
            {
                string query = "CORE.SP_registrarCuentaPorPagar";

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = System.Data.CommandType.StoredProcedure;
                    sqlcmd.Parameters.AddWithValue("@ID_Negocio", cuentaPorPagar.ID_Negocio);
                    sqlcmd.Parameters.AddWithValue("@Concepto", cuentaPorPagar.@Concepto);
                    sqlcmd.Parameters.AddWithValue("@Descripcion", cuentaPorPagar.Descripcion);
                    sqlcmd.Parameters.AddWithValue("@Saldo", cuentaPorPagar.Saldo);
                    this.Open();
                    using (var reader = sqlcmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            respuesta = manejarRespuesta(reader);
                        }
                    }
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
            return respuesta;
        }

        public DTO_Respuesta obtenerCuentaPorPagar(DTO_Negocio negocio)
        {
            List<DTO_CuentaPorPagar> listaCuentasPorPagar = [];
            DTO_CuentaPorPagar cuentaPorPagar;
            try
            {

                string query = "CORE.SP_obtenerCuentasPorPagar";


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
                    using (SqlDataReader reader = sqlcmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            cuentaPorPagar = new();
                            cuentaPorPagar.ID_CuentasPorPagar = UTL_DBHelper.ReadNullSafeInt(reader["ID_CuentasPorPagar"]);
                            cuentaPorPagar.ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]);
                            cuentaPorPagar.Estado.Nombre = UTL_DBHelper.ReadNullSafeString(reader["NombreEstado"]);
                            cuentaPorPagar.Concepto = UTL_DBHelper.ReadNullSafeString(reader["Concepto"]);
                            cuentaPorPagar.Descripcion = UTL_DBHelper.ReadNullSafeString(reader["Descripcion"]);
                            cuentaPorPagar.Saldo = UTL_DBHelper.ReadNullSafeDecimal(reader["Saldo"]);
                            cuentaPorPagar.FechaInicial = (DateTime)UTL_DBHelper.ReadNullSafeDateTime(reader["FechaInicial"]);
                            cuentaPorPagar.FechaModificacion = (DateTime)UTL_DBHelper.ReadNullSafeDateTime(reader["FechaModificacion"]);
                            cuentaPorPagar.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]);

                            listaCuentasPorPagar.Add(cuentaPorPagar);

                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = respuesta = manejarRespuesta(reader);

                            }
                        }

                        respuesta.Resultado.Add(listaCuentasPorPagar);
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

        public DTO_Respuesta actualizarCuentaPorPagar(DTO_CuentaPorPagar cuentaPorPagar)
        {
            try
            {
                string query = "CORE.SP_actualizarCuentasPorPagar";

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;

                    sqlcmd.Parameters.Add("@ID_CuentasPorPagar", SqlDbType.Int).Value = cuentaPorPagar.ID_CuentasPorPagar;
                    sqlcmd.Parameters.Add("@Concepto", SqlDbType.VarChar).Value = cuentaPorPagar.Concepto;
                    sqlcmd.Parameters.Add("@Descripcion", SqlDbType.VarChar).Value = cuentaPorPagar.Descripcion;
                    sqlcmd.Parameters.Add("@Saldo", SqlDbType.Decimal).Value = cuentaPorPagar.Saldo;
                    sqlcmd.Parameters.Add("@ID_Estado", SqlDbType.VarChar).Value = cuentaPorPagar.Estado.ID_Estado;
                    
                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    this.Open();

                    using (SqlDataReader reader = sqlcmd.ExecuteReader())
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
