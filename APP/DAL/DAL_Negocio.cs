using DTO;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UTL;
using System.Text.Json;

namespace DAL
{
    public class DAL_Negocio : DAL_Conexion
    {

        DTO_Respuesta respuesta = new();
        public DTO_Respuesta registrarNegocio(DTO_Negocio negocio)
        {

            try
            {
                string query = "CORE.SP_registrarNegocio";
                string json = JsonSerializer.Serialize(negocio.ReferenciaJSON);

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;

                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.Int).Value = negocio.ID_Usuario;
                    sqlcmd.Parameters.Add("@NombreNegocio", SqlDbType.VarChar).Value = negocio.NombreNegocio;
                    sqlcmd.Parameters.Add("@Descripcion", SqlDbType.NVarChar).Value = negocio.Descripcion;
                    sqlcmd.Parameters.Add("@Direccion", SqlDbType.NVarChar).Value = negocio.Direccion;
                    sqlcmd.Parameters.Add("@TelefonoNegocio", SqlDbType.VarChar).Value = negocio.TelefonoNegocio;
                    sqlcmd.Parameters.Add("@CorreoNegocio", SqlDbType.NVarChar).Value = negocio.CorreoNegocio;
                    sqlcmd.Parameters.Add("@ReferenciaJSON", SqlDbType.NVarChar, -1).Value = json;

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

        public DTO_Respuesta obtenerNegocios(DTO_Usuario usuario)
        {
            DTO_Negocio negocio = new();
            List<DTO_Negocio> listaNegocios = [];
            try
            {

                string query = "CORE.SP_obtenerNegocios";


                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.Int).Value = usuario.ID_Usuario;

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
                            negocio = new DTO_Negocio();
                            negocio.ID_Usuario = UTL_DBHelper.ReadNullSafeInt(reader["ID_Usuario"]);
                            negocio.ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]);
                            negocio.NombreNegocio = UTL_DBHelper.ReadNullSafeString(reader["NombreNegocio"]);
                            negocio.Descripcion = UTL_DBHelper.ReadNullSafeString(reader["Descripcion"]);
                            negocio.Direccion = UTL_DBHelper.ReadNullSafeString(reader["Direccion"]);
                            negocio.TelefonoNegocio = UTL_DBHelper.ReadNullSafeString(reader["TelefonoNegocio"]);
                            negocio.CorreoNegocio = UTL_DBHelper.ReadNullSafeString(reader["CorreoNegocio"]);
                            negocio.FechaRegistro = (DateTime)UTL_DBHelper.ReadNullSafeDateTime(reader["FechaRegistro"]);
                            negocio.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]);
                            negocio.Estado.Nombre = UTL_DBHelper.ReadNullSafeString(reader["Nombre"]);

                            //  ↓↓↓ Aquí es donde antes hacías new List<DTO_Param>(), 
                            //     ahora leemos la cadena JSON real de la base y la deserializamos:
                            string jsonReferencia = UTL_DBHelper.ReadNullSafeString(reader["ReferenciaJSON"]);
                            if (!string.IsNullOrWhiteSpace(jsonReferencia))
                            {
                                try
                                {
                                    // Deserializamos a List<DTO_Param>:
                                    negocio.ReferenciaJSON =
                                        Newtonsoft.Json.JsonConvert
                                            .DeserializeObject<List<DTO_Param>>(jsonReferencia)
                                        ?? new List<DTO_Param>();
                                }
                                catch (Exception jsonEx)
                                {
                                    // Si falla la deserialización, optar por:
                                    // - Lanzar excepción
                                    // - O asignar lista vacía e ignorar el error
                                    negocio.ReferenciaJSON = new List<DTO_Param>();
                                }
                            }
                            else
                            {
                                // Si el campo estuvo vacío o nulo:
                                negocio.ReferenciaJSON = new List<DTO_Param>();
                            }

                            listaNegocios.Add(negocio);
                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = respuesta = manejarRespuesta(reader);

                            }
                        }

                        respuesta.Resultado.Add(listaNegocios);
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

        public DTO_Respuesta actualizarNegocio(DTO_Negocio negocio)
        {
            try
            {
                string query = "CORE.SP_actualizarNegocio";
                string json = JsonSerializer.Serialize(negocio.ReferenciaJSON);

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;

                    sqlcmd.Parameters.Add("@ID_Negocio", SqlDbType.Int).Value = negocio.ID_Negocio;
                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.Int).Value = negocio.ID_Usuario;
                    sqlcmd.Parameters.Add("@ID_Estado", SqlDbType.Int).Value = negocio.Estado.ID_Estado;
                    sqlcmd.Parameters.Add("@NombreNegocio", SqlDbType.VarChar).Value = negocio.NombreNegocio;
                    sqlcmd.Parameters.Add("@Descripcion", SqlDbType.NVarChar).Value = negocio.Descripcion;
                    sqlcmd.Parameters.Add("@Direccion", SqlDbType.NVarChar).Value = negocio.Direccion;
                    sqlcmd.Parameters.Add("@TelefonoNegocio", SqlDbType.VarChar).Value = negocio.TelefonoNegocio;
                    sqlcmd.Parameters.Add("@CorreoNegocio", SqlDbType.NVarChar).Value = negocio.CorreoNegocio;
                    sqlcmd.Parameters.Add("@ReferenciaJSON", SqlDbType.NVarChar, -1).Value = json;

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
