using DTO;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class DAL_Mensaje : DAL_Conexion
    {
        public DTO_Respuesta guardarMensaje(DTO_Mensaje mensaje)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            try
            {

                string query = "SECU.SP_guardarRefreshToken";

                // Usar Microsoft.Data.SqlClient.SqlCommand en lugar de System.Data.SqlClient.SqlCommand
                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_ChatIA", SqlDbType.Int).Value = mensaje.ID_ChatIA;
                    sqlcmd.Parameters.Add("@Tipo", SqlDbType.NVarChar).Value = mensaje.Tipo;
                    sqlcmd.Parameters.Add("@TextoMensaje", SqlDbType.NVarChar).Value = mensaje.TextoMensaje;
                    sqlcmd.Parameters.Add("@TranscripcionAudio", SqlDbType.DateTime).Value = mensaje.TranscripcionAudio;
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
                            respuesta = manejarRespuesta(reader);
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
