using DTO;
using Microsoft.Data.SqlClient;
using System.Configuration;
using System.Reflection.PortableExecutable;
namespace DAL
{
    public class DAL_Conexion
    {
        private static DAL_Conexion? sqlConn;
        private SqlConnection Conn;


        protected DAL_Conexion()
        {
            // Se asegura de utilizar la cadena de conexión de la configuración
            Conn = new SqlConnection(ConfigurationManager.AppSettings["SqlConexion"] ?? "");
        }

        protected SqlConnection GetObjConexion()
        {
            return this.Conn;
        }


        protected Boolean Open()
        {
            try
            {
                if (Conn.State == System.Data.ConnectionState.Closed)
                    Conn.Open();

                return Conn.State == System.Data.ConnectionState.Open;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        protected Boolean Close()
        {
            try
            {
                if (Conn.State == System.Data.ConnectionState.Open)
                    Conn.Close();

                return Conn.State == System.Data.ConnectionState.Closed;
            }
            catch (SqlException e)
            {
                throw e;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        protected DTO_Respuesta manejarRespuesta(SqlDataReader reader) 
        {   
            DTO_Respuesta respuesta = new DTO_Respuesta();
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

            return respuesta;
        }
    }
}
