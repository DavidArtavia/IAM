using DTO;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UTL;

namespace DAL
{

    public class DAL_MetricaKPI : DAL_Conexion
    {

        DTO_Respuesta respuesta = new();
        public async Task<DTO_Respuesta> obtenerMetrica(DTO_MetricaKPI metricaKPI, DTO_Usuario usuario)
        {
            List<DTO_MetricaKPI> lista = new();
            try
            {
                string query = "CORE.SP_obtenerMetricas";


                using (SqlCommand sqlcmd = new(query, this.GetObjConexion()))
                {
                    sqlcmd.CommandType = CommandType.StoredProcedure;

                    sqlcmd.Parameters.Add("ID_Usuario", SqlDbType.Int).Value = usuario.ID_Usuario;
                    sqlcmd.Parameters.Add("@ID_Negocio", SqlDbType.Int).Value = metricaKPI.ID_Negocio;
                    sqlcmd.Parameters.Add("@Filtro", SqlDbType.VarChar).Value = metricaKPI.Filtro;

                    foreach (SqlParameter param in sqlcmd.Parameters)
                    {
                        param.Direction = ParameterDirection.Input;
                    }

                    this.Open();

                    using (SqlDataReader reader = await sqlcmd.ExecuteReaderAsync())
                    {


                   
                            while (reader.Read())
                            {

                            metricaKPI = new();
                            metricaKPI.TituloNegrita = UTL_DBHelper.ReadNullSafeString(reader["TituloNegrita"]);
                            metricaKPI.TituloRegular = UTL_DBHelper.ReadNullSafeString(reader["TituloRegular"]);
                            metricaKPI.OrdenTitulos = UTL_DBHelper.ReadNullSafeString(reader["OrdenTitulos"]);
                            metricaKPI.TXTColor = UTL_DBHelper.ReadNullSafeString(reader["TXTColor"]);
                            metricaKPI.BGColor = UTL_DBHelper.ReadNullSafeString(reader["BGColor"]);
                            metricaKPI.ValorRegular = UTL_DBHelper.ReadNullSafeString(reader["ValorRegular"]);
                            metricaKPI.ValorNegrita = UTL_DBHelper.ReadNullSafeString(reader["ValorNegrita"]);
                            metricaKPI.OrdenValores = UTL_DBHelper.ReadNullSafeString(reader["OrdenValores"]);
                            metricaKPI.Icono = UTL_DBHelper.ReadNullSafeString(reader["Icono"]);
                            metricaKPI.Info = UTL_DBHelper.ReadNullSafeString(reader["Info"]);
      
                            lista.Add(metricaKPI);
                            }

                            // Segundo result set: COD_ALERTA
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    respuesta = manejarRespuesta(reader);
                                }
                            }


                        // Agregamos la transacción como resultado
                        respuesta.Resultado.Add(lista);
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

