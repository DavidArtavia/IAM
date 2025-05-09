using DTO;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class DAL_Sesion : DAL_Conexion
    {

        public DTO_Respuesta guardarRefreshToken(DTO_Sesion sesion)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            try
            {

                string query = "SECU.SP_guardarRefreshToken";

                // Usar Microsoft.Data.SqlClient.SqlCommand en lugar de System.Data.SqlClient.SqlCommand
                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.Int).Value = sesion.ID_Usuario;
                    sqlcmd.Parameters.Add("@RefreshToken", SqlDbType.NVarChar).Value = sesion.RefreshToken;
                    sqlcmd.Parameters.Add("@FechaExpiracion", SqlDbType.DateTime).Value = DateTime.Now.AddDays(Convert.ToInt32(ConfigurationManager.AppSettings["SesionDaysExpiration"]));
                    sqlcmd.Parameters.Add("@UserAgent", SqlDbType.NVarChar).Value = sesion.UserAgent;
                    sqlcmd.Parameters.Add("@IPUsuario", SqlDbType.NVarChar).Value = sesion.IPUsuario;

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
