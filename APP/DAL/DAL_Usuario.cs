using DTO;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UTL;

namespace DAL
{
    public class DAL_Usuario : DAL_Conexion
    {
       
        public DTO_Respuesta registrarUsuario(DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            try
            {
                // 01-usp_RegistrarUsuario
                string query = "CORE.SP_registrarUsuario";

                // Usar Microsoft.Data.SqlClient.SqlCommand en lugar de System.Data.SqlClient.SqlCommand
                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@NombreUsuario", SqlDbType.NVarChar).Value = usuario.NombreUsuario;
                    sqlcmd.Parameters.Add("@Apellido", SqlDbType.NVarChar).Value = usuario.Apellido;
                    sqlcmd.Parameters.Add("@TelefonoUsuario", SqlDbType.NVarChar).Value = usuario.CorreoUsuario;
                    sqlcmd.Parameters.Add("@CorreoUsuario", SqlDbType.NVarChar).Value = usuario.Pass;
                    sqlcmd.Parameters.Add("@Pass", SqlDbType.NVarChar).Value = usuario.TelefonoUsuario;

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
                            respuesta = new DTO_Respuesta();

                            //Validar si hay error controlado
                            if (UTL.UTL_DBHelper.ReadNullSafeString(reader["Tipo"]) == "E")
                            {
                                respuesta.TipoRespuesta = false;
                                respuesta.Codigo = "400";
                            }
                            else
                            {
                                respuesta.TipoRespuesta = true;
                                respuesta.Codigo = "200";
                            }

                            respuesta.Mensaje = UTL.UTL_DBHelper.ReadNullSafeString(reader["Mensaje"]);
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
    }
}
