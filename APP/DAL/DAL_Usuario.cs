using DTO;
using Microsoft.Data.SqlClient;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
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
    }
}
