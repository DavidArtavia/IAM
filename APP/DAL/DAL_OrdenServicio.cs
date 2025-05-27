using DTO;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace DAL
{
    public class DAL_OrdenServicio : DAL_Conexion
    {

        DTO_Respuesta respuesta = new();

        public DTO_Respuesta registrarOrdenServicio(DTO_OrdenServicio ordenServicio)
        {
            try
            {
                string query = "CORE.SP_registrarOrdenServicio";
                string json = JsonSerializer.Serialize(ordenServicio.ReferenciaJSON);


                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = System.Data.CommandType.StoredProcedure;
                    sqlcmd.Parameters.AddWithValue("@ID_Cliente", ordenServicio.ID_Cliente);
                    sqlcmd.Parameters.AddWithValue("@ID_Negocio", ordenServicio.ID_Negocio);
                    sqlcmd.Parameters.AddWithValue("@ID_Estado", ordenServicio.Estado.ID_Estado);
                    sqlcmd.Parameters.AddWithValue("@FechaEstimadaEntrega", ordenServicio.FechaEstimadaEntrega);
                    sqlcmd.Parameters.AddWithValue("@FechaInicio", ordenServicio.FechaInicio);
                    sqlcmd.Parameters.AddWithValue("@FechaFinal", ordenServicio.FechaFinal);
                    sqlcmd.Parameters.AddWithValue("@FechaEntrega", ordenServicio.FechaEntrega);
                    sqlcmd.Parameters.AddWithValue("@NotaOrdenServicio", ordenServicio.NotaOrdenServicio);
                    sqlcmd.Parameters.Add("@ReferenciaJSON", SqlDbType.NVarChar, -1).Value = json;

                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    this.Open();

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
                throw e;
            }
            finally
            {
                this.Close();
            }
        }


        public DTO_Respuesta actualizarOrdenServicio(DTO_OrdenServicio ordenServicio)
        {
            try
            {
                string query = "CORE.SP_actualizarOrdenServicio";
                string json = JsonSerializer.Serialize(ordenServicio.ReferenciaJSON);

                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;

                    sqlcmd.Parameters.Add("@ID_OrdenServicio", SqlDbType.Int).Value = ordenServicio.ID_OrdenServicio;
                    sqlcmd.Parameters.Add("@ID_Estado", SqlDbType.Int).Value = ordenServicio.Estado.ID_Estado;
                    sqlcmd.Parameters.Add("@FechaEstimadaEntrega", SqlDbType.DateTime).Value = ordenServicio.FechaEstimadaEntrega;
                    sqlcmd.Parameters.Add("@FechaInicio", SqlDbType.DateTime).Value = ordenServicio.FechaInicio;
                    sqlcmd.Parameters.Add("@FechaFinal", SqlDbType.DateTime).Value = ordenServicio.FechaFinal;
                    sqlcmd.Parameters.Add("@FechaEntrega", SqlDbType.DateTime).Value = ordenServicio.FechaEntrega;
                    sqlcmd.Parameters.Add("@ReferenciaJSON", SqlDbType.NVarChar, -1).Value = json;
                    sqlcmd.Parameters.Add("@NotaOrdenServicio", SqlDbType.VarChar).Value = ordenServicio.NotaOrdenServicio;

                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    this.Open();

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
                throw e;
            }
            finally
            {
                this.Close();
            }
        }
        public DTO_Respuesta obtenerOrdenesServicio(DTO_Usuario usuario)
        {
            return null;
        }
    }
}
