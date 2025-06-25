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
    public class DAL_ChatIA : DAL_Conexion
    {

        public DTO_Respuesta obtenerChats(DTO_Negocio negocio)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            List<DTO_ChatIA> listaChats = new List<DTO_ChatIA>();
            DTO_ChatIA chatIA = new DTO_ChatIA();
            try
            {

                string query = "CORE.SP_obtenerChats";


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
                            chatIA = new DTO_ChatIA();
                            chatIA.ID_ChatIA = UTL_DBHelper.ReadNullSafeInt(reader["ID_ChatIA"]);
                            chatIA.ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]);
                            chatIA.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]);
                            chatIA.Estado.Nombre = UTL_DBHelper.ReadNullSafeString(reader["Nombre"]);
                            chatIA.FechaInicial = (DateTime)UTL_DBHelper.ReadNullSafeDateTime(reader["FechaInicial"]);
                            chatIA.FechaFinal = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaFinal"]);

                            listaChats.Add(chatIA);


                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = respuesta = manejarRespuesta(reader);

                            }
                        }

                        respuesta.Resultado.Add(listaChats);
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
        public async Task<DTO_Respuesta> crearChat(DTO_Negocio negocio)
        {
            DTO_Respuesta respuesta = new();
            DTO_ChatIA nuevoChat = new(); // Asegúrate de tener este modelo

            try
            {
                string query = "CORE.SP_crearChatIA";

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Negocio", SqlDbType.Int).Value = negocio.ID_Negocio;

                    foreach (SqlParameter param in sqlcmd.Parameters)
                        param.Direction = ParameterDirection.Input;

                    this.Open();

                    using (SqlDataReader reader = await sqlcmd.ExecuteReaderAsync())
                    {
                        // Primer resultado: datos del chat insertado
                        if (reader.Read())
                        {
                            nuevoChat.ID_ChatIA = UTL_DBHelper.ReadNullSafeInt(reader["ID_ChatIA"]);
                            nuevoChat.ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]);
                            nuevoChat.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]);
                            nuevoChat.FechaInicial = (DateTime)UTL_DBHelper.ReadNullSafeDateTime(reader["FechaInicial"]);
                            nuevoChat.FechaFinal = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaFinal"]);
                        }

                        // Siguiente resultado: alerta
                        if (await reader.NextResultAsync() && reader.Read())
                        {
                            respuesta = manejarRespuesta(reader);
                        }

                        // Adjuntamos el nuevo chat a Resultado
                        respuesta.Resultado.Add(nuevoChat);
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
