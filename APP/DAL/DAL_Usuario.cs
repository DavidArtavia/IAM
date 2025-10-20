using DTO;
using Microsoft.Data.SqlClient;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using UTL;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace DAL
{
    public class DAL_Usuario : DAL_Conexion
    {
       
        public DTO_Respuesta registrarUsuario(DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            try
            {

                string query = "SECU.SP_registrarUsuario";


                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;

                    sqlcmd.Parameters.Add("@NombreUsuario", SqlDbType.VarChar).Value = usuario.NombreUsuario;
                    sqlcmd.Parameters.Add("@Apellido", SqlDbType.VarChar).Value = usuario.Apellido;
                    sqlcmd.Parameters.Add("@TelefonoUsuario", SqlDbType.VarChar).Value = usuario.TelefonoUsuario;

                    sqlcmd.Parameters.Add("@CorreoUsuario", SqlDbType.NVarChar).Value = usuario.CorreoUsuario;
                    sqlcmd.Parameters.Add("@Pass", SqlDbType.NVarChar).Value = usuario.Pass;

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
                            respuesta = respuesta = manejarRespuesta(reader);
                        }
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
        public DTO_Respuesta obtenerUsuario(DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            try
            {

                string query = "SECU.SP_obtenerUsuario";


                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@CorreoUsuario", SqlDbType.NVarChar).Value = usuario.CorreoUsuario;

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
                            respuesta = respuesta = manejarRespuesta(reader);
                        }

                        if (reader.NextResult())
                        {
                            usuario = new DTO_Usuario();
                            while (reader.Read())
                            {
                                usuario.ID_Usuario = UTL_DBHelper.ReadNullSafeInt(reader["ID_Usuario"]);
                                usuario.NombreUsuario = UTL_DBHelper.ReadNullSafeString(reader["NombreUsuario"]);
                                usuario.Apellido = UTL_DBHelper.ReadNullSafeString(reader["Apellido"]);
                                usuario.TelefonoUsuario = UTL_DBHelper.ReadNullSafeString(reader["TelefonoUsuario"]);
                                usuario.CorreoUsuario = UTL_DBHelper.ReadNullSafeString(reader["CorreoUsuario"]);
                                usuario.Pass = UTL_DBHelper.ReadNullSafeString(reader["Pass"]);
                                usuario.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]);
                                usuario.Estado.Nombre = UTL_DBHelper.ReadNullSafeString(reader["Nombre"]);
                                usuario.Rol.ID_Rol = UTL_DBHelper.ReadNullSafeInt(reader["ID_Rol"]);
                                usuario.Rol.NombreRol = UTL_DBHelper.ReadNullSafeString(reader["NombreRol"]);
                                usuario.Rol.DescripcionRol = UTL_DBHelper.ReadNullSafeString(reader["DescripcionRol"]);
                                
                            }

                        }

                        respuesta.Resultado.Add(usuario);

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

        public DTO_Respuesta obtenerUsuarioPorId(DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            try
            {

                string query = "SECU.SP_obtenerUsuarioPorId";


                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.NVarChar).Value = usuario.ID_Usuario;

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
                            usuario = new DTO_Usuario();
      
                                usuario.ID_Usuario = UTL_DBHelper.ReadNullSafeInt(reader["ID_Usuario"]);
                                usuario.NombreUsuario = UTL_DBHelper.ReadNullSafeString(reader["NombreUsuario"]);
                                usuario.Apellido = UTL_DBHelper.ReadNullSafeString(reader["Apellido"]);
                                usuario.TelefonoUsuario = UTL_DBHelper.ReadNullSafeString(reader["TelefonoUsuario"]);
                                usuario.CorreoUsuario = UTL_DBHelper.ReadNullSafeString(reader["CorreoUsuario"]);
                                usuario.Pass = UTL_DBHelper.ReadNullSafeString(reader["Pass"]);
                                usuario.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]);
                                usuario.Estado.Nombre = UTL_DBHelper.ReadNullSafeString(reader["Nombre"]);
                                usuario.Rol.ID_Rol = UTL_DBHelper.ReadNullSafeInt(reader["ID_Rol"]);
                                usuario.Rol.NombreRol = UTL_DBHelper.ReadNullSafeString(reader["NombreRol"]);
                                usuario.Rol.DescripcionRol = UTL_DBHelper.ReadNullSafeString(reader["DescripcionRol"]);
                           
                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = manejarRespuesta(reader);
                            }
                        }

                        respuesta.Resultado.Add(usuario);

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

        public DTO_Respuesta actualizarUsuario(DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta = new();

            try
            {
                string query = "SECU.SP_actualizarUsuario";

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;


                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.Int).Value = usuario.ID_Usuario;
                    sqlcmd.Parameters.Add("@NombreUsuario", SqlDbType.VarChar).Value = usuario.NombreUsuario;
                    sqlcmd.Parameters.Add("@Apellido", SqlDbType.VarChar).Value = usuario.Apellido;
                    sqlcmd.Parameters.Add("@TelefonoUsuario", SqlDbType.VarChar).Value = usuario.TelefonoUsuario;


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

        public DTO_Respuesta GenerarCodigoVerificacion(DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();

            try
            {
                string query = "SECU.SP_GenerarCodigoVerificacion";

                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.Int).Value = usuario.ID_Usuario;

                    foreach (SqlParameter param in sqlcmd.Parameters)
                        param.Direction = ParameterDirection.Input;

                    this.Open();
                    using (SqlDataReader reader = sqlcmd.ExecuteReader())
                    {
                        // 1) Alertas
                        while (reader.Read())
                        {
                            respuesta = manejarRespuesta(reader);
                        }
                        // 2) Código + expiración (si lo hay)
                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                var codigoDto = new DTO_CodigoVerificacion
                                {
                                    // OJO: estos nombres vienen del alias del SP, no de la tabla física
                                    CodigoAlfaNum = UTL.UTL_DBHelper.ReadNullSafeString(reader["CODIGO_ALFA_NUM"]),
                                    FechaExpiracion = UTL.UTL_DBHelper.ReadNullSafeDateTime(reader["FECHA_EXPIRACION"]),
                                };
                                respuesta.Resultado.Add(codigoDto);
                            }
                        }
                    }
                }
                return respuesta;
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

        public DTO_Respuesta ReenviarCodigoVerificacion(DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();

            try
            {
                string query = "SECU.SP_ReenviarCodigoVerificacion";

                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.Int).Value = usuario.ID_Usuario;

                    foreach (SqlParameter param in sqlcmd.Parameters)
                        param.Direction = ParameterDirection.Input;

                    this.Open();
                    using (SqlDataReader reader = sqlcmd.ExecuteReader())
                    {
                        // 1) Alertas
                        while (reader.Read())
                        {
                            respuesta = manejarRespuesta(reader);
                        }
                        // 2) Código + expiración
                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                var codigoDto = new DTO_CodigoVerificacion
                                {
                                    // OJO: estos nombres vienen del alias del SP, no de la tabla física
                                    CodigoAlfaNum = UTL.UTL_DBHelper.ReadNullSafeString(reader["CODIGO_ALFA_NUM"]),
                                    FechaExpiracion = UTL.UTL_DBHelper.ReadNullSafeDateTime(reader["FECHA_EXPIRACION"]),
                                };
                                respuesta.Resultado.Add(codigoDto);
                            }
                        }
                    }
                }
                return respuesta;
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

        public DTO_Respuesta ValidarCodigoVerificacion(DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();

            try
            {
                string query = "SECU.SP_ValidarCodigoVerificacion";

                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.Int).Value = usuario.ID_Usuario;
                    sqlcmd.Parameters.Add("@Codigo", SqlDbType.VarChar).Value = (usuario.CodigoVerificacion ?? string.Empty).Trim();

                    foreach (SqlParameter param in sqlcmd.Parameters)
                        param.Direction = ParameterDirection.Input;

                    this.Open();
                    using (SqlDataReader reader = sqlcmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            respuesta = manejarRespuesta(reader);
                        }
                    }
                }
                return respuesta;
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
