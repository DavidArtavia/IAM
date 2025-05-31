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
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace DAL
{
    public class DAL_Mensaje : DAL_Conexion
    {
        public DTO_Respuesta guardarMensaje(DTO_Mensaje mensaje)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            try
            {

                string query = "CORE.SP_guardarMensaje";

                
                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_ChatIA", SqlDbType.Int).Value = mensaje.ID_ChatIA;
                    sqlcmd.Parameters.Add("@Envia", SqlDbType.NVarChar).Value = mensaje.Envia;
                    sqlcmd.Parameters.Add("@Recibe", SqlDbType.NVarChar).Value = mensaje.Recibe;
                    sqlcmd.Parameters.Add("@Contenido", SqlDbType.NVarChar).Value = mensaje.Contenido;
                    sqlcmd.Parameters.Add("@Parametros", SqlDbType.NVarChar).Value = JsonConvert.SerializeObject(mensaje.Parametros);
                    sqlcmd.Parameters.Add("@RutaAudio", SqlDbType.NVarChar).Value = mensaje.RutaAudio;

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
                            mensaje.ID_Mensaje = UTL_DBHelper.ReadNullSafeInt(reader["ID_Mensaje"]);
                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = manejarRespuesta(reader);

                            }
                        }

                    }
                    respuesta.Resultado.Add(mensaje);
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

        public DTO_Respuesta obtenerMensajes(DTO_ChatIA ChatIA)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            List<DTO_Mensaje> listaMensajes = new List<DTO_Mensaje>();
            DTO_Mensaje mensaje = new DTO_Mensaje();
            try
            {

                string query = "CORE.SP_obtenerMensajesChat";

                
                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_ChatIA", SqlDbType.Int).Value = ChatIA.ID_ChatIA;

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
                            mensaje = new DTO_Mensaje();
                            mensaje.ID_Mensaje = UTL_DBHelper.ReadNullSafeInt(reader["ID_Mensaje"]);
                            mensaje.ID_ChatIA = UTL_DBHelper.ReadNullSafeInt(reader["ID_ChatIA"]);
                            mensaje.Envia = UTL_DBHelper.ReadNullSafeString(reader["Envia"]);
                            mensaje.Recibe = UTL_DBHelper.ReadNullSafeString(reader["Recibe"]);
                            mensaje.Contenido = UTL_DBHelper.ReadNullSafeString(reader["Contenido"]);
                            mensaje.Parametros = JsonSerializer.Deserialize<List<DTO_Param>>(UTL_DBHelper.ReadNullSafeString(reader["Parametros"])) ?? new();
                            mensaje.RutaAudio = UTL_DBHelper.ReadNullSafeString(reader["RutaAudio"]);
                            mensaje.FechaMensaje = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaMensaje"]);

                            listaMensajes.Add(mensaje);

                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = respuesta = manejarRespuesta(reader);

                            }
                        }
                    }
                    respuesta.Resultado.Add(listaMensajes);
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
