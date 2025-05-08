using Microsoft.Data.SqlClient;
using System.Configuration;
namespace DAL
{
    public class DAL_Conexion
    {
        private static DAL_Conexion? sqlConn;
        private SqlConnection Conn;


        protected DAL_Conexion()
        {
            // Se asegura de utilizar la cadena de conexión de la configuración
            Conn = new SqlConnection(ConfigurationManager.AppSettings["SqlConexionQA"] ?? "");
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
    }
}
