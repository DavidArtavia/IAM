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
    public class DAL_Contexto: DAL_Conexion
    {
        public DTO_Respuesta obtenerContexto()
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
            DTO_Contexto contexto = new DTO_Contexto(); 
            List<DTO_Contexto> listaContexto = new List<DTO_Contexto>();

            try
            {

                string query = "SECU.SP_obtenerContexto";

                
                using (SqlCommand sqlcmd = new SqlCommand(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    //sqlcmd.Parameters.Add("@NombreCliente", SqlDbType.VarChar).Value = cliente.NombreCliente;

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
                            contexto = new DTO_Contexto();
                            contexto.ID_Contexto = UTL_DBHelper.ReadNullSafeInt(reader["ID_CONTEXTO"]);
                            contexto.Nombre = UTL_DBHelper.ReadNullSafeString(reader["Nombre"]);
                            contexto.Tipo = UTL_DBHelper.ReadNullSafeString(reader["Tipo"]);
                            contexto.Prompt = UTL_DBHelper.ReadNullSafeString(reader["Prompt"]);

                            listaContexto.Add(contexto);
                        }


                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                respuesta = respuesta = manejarRespuesta(reader);

                            }
                        }

                        respuesta.Resultado.Add(listaContexto);
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
