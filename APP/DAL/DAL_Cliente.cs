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
    public class DAL_Cliente: DAL_Conexion
    {
        public DTO_Respuesta buscarCliente(DTO_Cliente cliente)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            List<DTO_Cliente> listaCliente = new List<DTO_Cliente>();
            try
            {

                string query = "CORE.SP_buscarCliente";

                
                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@NombreCliente", SqlDbType.VarChar).Value = cliente.NombreCliente;
                    sqlcmd.Parameters.Add("@ApellidoCliente", SqlDbType.VarChar).Value = cliente.ApellidoCliente;

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
                            cliente = new DTO_Cliente();
                            cliente.ID_Cliente = UTL_DBHelper.ReadNullSafeInt(reader["ID_Cliente"]);
                            cliente.ID_Usuario = UTL_DBHelper.ReadNullSafeInt(reader["ID_Usuario"]);
                            cliente.NombreCliente = UTL_DBHelper.ReadNullSafeString(reader["NombreCliente"]);
                            cliente.ApellidoCliente = UTL_DBHelper.ReadNullSafeString(reader["ApellidoCliente"]);
                            cliente.TelefonoCliente = UTL_DBHelper.ReadNullSafeString(reader["TelefonoCliente"]);
                            cliente.CorreoCliente = UTL_DBHelper.ReadNullSafeString(reader["CorreoCliente"]);

                            listaCliente.Add(cliente);
                        }
       

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = respuesta = manejarRespuesta(reader);

                            }
                        }

                        respuesta.Resultado.Add(listaCliente);
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

        public DTO_Respuesta guardarCliente(DTO_Usuario usuario, DTO_Cliente cliente)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            try
            {

                string query = "CORE.SP_guardarCliente";


                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.Int).Value = usuario.ID_Usuario;
                    sqlcmd.Parameters.Add("@NombreCliente", SqlDbType.VarChar).Value = cliente.NombreCliente;
                    sqlcmd.Parameters.Add("@ApellidoCliente", SqlDbType.VarChar).Value = cliente.ApellidoCliente;
                    sqlcmd.Parameters.Add("@TelefonoCliente", SqlDbType.VarChar).Value = cliente.TelefonoCliente;
                    sqlcmd.Parameters.Add("@CorreoCliente", SqlDbType.VarChar).Value = cliente.CorreoCliente;


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
