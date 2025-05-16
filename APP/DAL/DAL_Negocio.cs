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
    public class DAL_Negocio: DAL_Conexion
    {
        public DTO_Respuesta obtenerNegocios(DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            DTO_Negocio negocio = new DTO_Negocio();
            List<DTO_Negocio> listaNegocios = new List<DTO_Negocio>();
            try
            {

                string query = "CORE.SP_obtenerNegocios";

                
                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@ID_Usuario", SqlDbType.Int).Value = usuario.ID_Usuario;

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
                            negocio = new DTO_Negocio();
                            negocio.ID_Usuario = UTL_DBHelper.ReadNullSafeInt(reader["ID_Usuario"]);
                            negocio.ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]);
                            negocio.NombreNegocio = UTL_DBHelper.ReadNullSafeString(reader["NombreNegocio"]);
                            negocio.Descripcion = UTL_DBHelper.ReadNullSafeString(reader["Descripcion"]);
                            negocio.Direccion = UTL_DBHelper.ReadNullSafeString(reader["Direccion"]);
                            negocio.TelefonoNegocio = UTL_DBHelper.ReadNullSafeString(reader["TelefonoNegocio"]);
                            negocio.CorreoNegocio = UTL_DBHelper.ReadNullSafeString(reader["CorreoNegocio"]);
                            negocio.FechaRegistro = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaRegistro"]);
                            negocio.ReferenciaJSON = UTL_DBHelper.ReadNullSafeString(reader["ReferenciaJSON"]);
                            negocio.Estado.ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]);
                            negocio.Estado.Nombre = UTL_DBHelper.ReadNullSafeString(reader["Nombre"]);
                            
                            listaNegocios.Add(negocio);

                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = respuesta = manejarRespuesta(reader);

                            }
                        }

                        respuesta.Resultado.Add(listaNegocios);
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
