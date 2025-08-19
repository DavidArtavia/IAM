using DTO;
using Microsoft.Data.SqlClient;
using System.Data;
using UTL;

namespace DAL
{
    public class DAL_Proforma : DAL_Conexion
    {
        private DTO_Respuesta respuesta = new();

        public async Task<DTO_Respuesta> RegistrarProforma(DTO_Proforma proforma)
        {
            respuesta = new DTO_Respuesta();
            try
            {
                using var sqlcmd = new SqlCommand("CORE.SP_registrarProforma", GetObjConexion())
                { CommandType = CommandType.StoredProcedure };

                sqlcmd.Parameters.Add("@ID_Negocio", SqlDbType.Int).Value = proforma.ID_Negocio;
                sqlcmd.Parameters.Add("@ID_Cliente", SqlDbType.Int).Value = proforma.ID_Cliente;
                sqlcmd.Parameters.Add("@ID_Estado", SqlDbType.Int).Value = proforma.Estado?.ID_Estado;
                sqlcmd.Parameters.Add("@ObservacionProforma", SqlDbType.NVarChar, 255).Value =
                    (object?)proforma.ObservacionProforma ?? DBNull.Value;
                sqlcmd.Parameters.Add("@FechaVencimiento", SqlDbType.DateTime).Value =
                    (object?)proforma.FechaVencimiento ?? DBNull.Value;

                Open();
                using var reader = await sqlcmd.ExecuteReaderAsync();

                DTO_Proforma inserted = new();
                if (await reader.ReadAsync())
                {
                    inserted.ID_Proforma = UTL_DBHelper.ReadNullSafeInt(reader["ID_Proforma"]);
                    inserted.ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]);
                    inserted.ID_Cliente = UTL_DBHelper.ReadNullSafeInt(reader["ID_Cliente"]);
                    inserted.Estado = new DTO_Estado
                    {
                        ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]),
                        Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"])
                    };
                    inserted.FechaProforma = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaProforma"]);
                    inserted.FechaVencimiento = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaVencimiento"]);
                    inserted.ObservacionProforma = UTL_DBHelper.ReadNullSafeString(reader["ObservacionProforma"]);
                }

                if (reader.NextResult())
                {
                    while (await reader.ReadAsync())
                        respuesta = manejarRespuesta(reader); // B039
                }

                respuesta.Resultado.Add(inserted);
                return respuesta;
            }
            catch (Exception e) { Close(); throw e; }
            finally { Close(); }
        }

        public async Task<DTO_Respuesta> ActualizarProforma(DTO_Proforma p)
        {
            respuesta = new DTO_Respuesta();
            try
            {
                using var cmd = new SqlCommand("CORE.SP_actualizarProforma", GetObjConexion())
                { CommandType = CommandType.StoredProcedure };

                cmd.Parameters.Add("@ID_Proforma", SqlDbType.Int).Value = p.ID_Proforma;
                cmd.Parameters.Add("@ID_Cliente", SqlDbType.Int).Value = (object?)p.ID_Cliente ?? DBNull.Value;
                cmd.Parameters.Add("@ID_Estado", SqlDbType.Int).Value = p.Estado.ID_Estado;
                cmd.Parameters.Add("@ObservacionProforma", SqlDbType.NVarChar, 255).Value =
                    (object?)p.ObservacionProforma ?? DBNull.Value;
                cmd.Parameters.Add("@FechaVencimiento", SqlDbType.DateTime).Value =
                    (object?)p.FechaVencimiento ?? DBNull.Value;

                Open();
                using var reader = await cmd.ExecuteReaderAsync();

                DTO_Proforma updated = new();
                if (await reader.ReadAsync())
                {
                    updated.ID_Proforma = UTL_DBHelper.ReadNullSafeInt(reader["ID_Proforma"]);
                    updated.ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]);
                    updated.ID_Cliente = UTL_DBHelper.ReadNullSafeInt(reader["ID_Cliente"]);
                    updated.Estado = new DTO_Estado
                    {
                        ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]),
                        Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"])
                    };
                    updated.FechaProforma = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaProforma"]);
                    updated.FechaVencimiento = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaVencimiento"]);
                    updated.ObservacionProforma = UTL_DBHelper.ReadNullSafeString(reader["ObservacionProforma"]);
                    updated.FechaModificacion = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaModificacion"]);
                }

                if (reader.NextResult())
                {
                    while (await reader.ReadAsync())
                        respuesta = manejarRespuesta(reader); // B045
                }

                respuesta.Resultado.Add(updated);
                return respuesta;
            }
            catch (Exception e) { Close(); throw e; }
            finally { Close(); }
        }

        public async Task<DTO_Respuesta> ObtenerProformas(DTO_Proforma proforma)
        {
            respuesta = new DTO_Respuesta();
            var lista = new List<DTO_Proforma>();
            try
            {
                using var cmd = new SqlCommand("CORE.SP_ObtenerProformas", GetObjConexion())
                { CommandType = CommandType.StoredProcedure };

                cmd.Parameters.Add("@ID_Negocio", SqlDbType.Int).Value = proforma.ID_Negocio;
                // Opcionales
                cmd.Parameters.Add("@ID_Cliente", SqlDbType.Int).Value = proforma.ID_Cliente > 0 ? proforma.ID_Cliente : (object)DBNull.Value;
                cmd.Parameters.Add("@ID_Estado", SqlDbType.Int).Value = (object?)(proforma.Estado?.ID_Estado > 0 ? proforma.Estado.ID_Estado : null) ?? DBNull.Value;


                Open();
                using var reader = await cmd.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var p = new DTO_Proforma
                    {
                        ID_Proforma = UTL_DBHelper.ReadNullSafeInt(reader["ID_Proforma"]),
                        ID_Negocio = UTL_DBHelper.ReadNullSafeInt(reader["ID_Negocio"]),
                        ID_Cliente = UTL_DBHelper.ReadNullSafeInt(reader["ID_Cliente"]),
                        Estado = new DTO_Estado
                        {
                            ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]),
                            Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"])
                        },
                        FechaProforma = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaProforma"]),
                        FechaVencimiento = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaVencimiento"]),
                        ObservacionProforma = UTL_DBHelper.ReadNullSafeString(reader["ObservacionProforma"]),
                        TotalCalculado = UTL_DBHelper.ReadNullSafeDecimal(reader["TotalCalculado"]),
                    };
                    lista.Add(p);
                }

                if (reader.NextResult())
                {
                    while (await reader.ReadAsync())
                        respuesta = manejarRespuesta(reader); // B047
                }

                respuesta.Resultado.Add(lista);
                return respuesta;
            }
            catch (Exception e) { Close(); throw e; }
            finally { Close(); }
        }

        // ====== Ítems ======
        public async Task<DTO_Respuesta> RegistrarItemsProforma(DTO_ProformaItem item)
        {
            respuesta = new DTO_Respuesta();
            try
            {
                using var cmd = new SqlCommand("CORE.SP_registrarItemsProforma", GetObjConexion())
                { CommandType = CommandType.StoredProcedure };

                cmd.Parameters.Add("@ID_Proforma", SqlDbType.Int).Value = item.ID_Proforma;
                cmd.Parameters.Add("@NombreItemProforma", SqlDbType.VarChar, 100).Value = item.NombreItemProforma;
                cmd.Parameters.Add("@DescripcionItemProforma", SqlDbType.NVarChar, 255).Value =
                    (object?)item.DescripcionItemProforma ?? DBNull.Value;
                cmd.Parameters.Add("@PrecioItemProforma", SqlDbType.Decimal).Value = item.PrecioItemProforma;
                cmd.Parameters.Add("@CantidadItemProforma", SqlDbType.Decimal).Value = item.CantidadItemProforma;

                Open();
                using var reader = await cmd.ExecuteReaderAsync();

                DTO_ProformaItem inserted = new();
                if (await reader.ReadAsync())
                {
                    inserted.ID_ProformaItem = UTL_DBHelper.ReadNullSafeInt(reader["ID_ProformaItem"]);
                    inserted.ID_Proforma = UTL_DBHelper.ReadNullSafeInt(reader["ID_Proforma"]);
                    inserted.Estado = new DTO_Estado
                    {
                        ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]),
                        Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"])
                    };
                    inserted.NombreItemProforma = UTL_DBHelper.ReadNullSafeString(reader["NombreItemProforma"]);
                    inserted.DescripcionItemProforma = UTL_DBHelper.ReadNullSafeString(reader["DescripcionItemProforma"]);
                    inserted.PrecioItemProforma = UTL_DBHelper.ReadNullSafeDecimal(reader["PrecioItemProforma"]);
                    inserted.CantidadItemProforma = UTL_DBHelper.ReadNullSafeDecimal(reader["CantidadItemProforma"]);
                    inserted.FechaCreacion = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaCreacion"]);
                    inserted.FechaModificacion = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaModificacion"]);
                }

                if (reader.NextResult())
                {
                    while (await reader.ReadAsync())
                        respuesta = manejarRespuesta(reader); // B040
                }

                respuesta.Resultado.Add(inserted);
                return respuesta;
            }
            catch (Exception e) { Close(); throw e; }
            finally { Close(); }
        }

        public async Task<DTO_Respuesta> ActualizarItemsProforma(DTO_ProformaItem item)
        {
            respuesta = new DTO_Respuesta();
            try
            {
                using var cmd = new SqlCommand("CORE.SP_actualizarItemsProforma", GetObjConexion())
                { CommandType = CommandType.StoredProcedure };

                cmd.Parameters.Add("@ID_ProformaItem", SqlDbType.Int).Value = item.ID_ProformaItem;
                cmd.Parameters.Add("@ID_Estado", SqlDbType.Int).Value = item.Estado.ID_Estado;
                cmd.Parameters.Add("@NombreItemProforma", SqlDbType.VarChar, 100).Value = item.NombreItemProforma;
                cmd.Parameters.Add("@DescripcionItemProforma", SqlDbType.NVarChar, 255).Value =
                    (object?)item.DescripcionItemProforma ?? DBNull.Value;
                cmd.Parameters.Add("@PrecioItemProforma", SqlDbType.Decimal).Value = item.PrecioItemProforma;
                cmd.Parameters.Add("@CantidadItemProforma", SqlDbType.Decimal).Value = item.CantidadItemProforma;

                Open();
                using var reader = await cmd.ExecuteReaderAsync();

                DTO_ProformaItem updated = new();
                if (await reader.ReadAsync())
                {
                    updated.ID_ProformaItem = UTL_DBHelper.ReadNullSafeInt(reader["ID_ProformaItem"]);
                    updated.ID_Proforma = UTL_DBHelper.ReadNullSafeInt(reader["ID_Proforma"]);
                    updated.Estado = new DTO_Estado
                    {
                        ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]),
                        Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"])
                    };
                    updated.NombreItemProforma = UTL_DBHelper.ReadNullSafeString(reader["NombreItemProforma"]);
                    updated.DescripcionItemProforma = UTL_DBHelper.ReadNullSafeString(reader["DescripcionItemProforma"]);
                    updated.PrecioItemProforma = UTL_DBHelper.ReadNullSafeDecimal(reader["PrecioItemProforma"]);
                    updated.CantidadItemProforma = UTL_DBHelper.ReadNullSafeDecimal(reader["CantidadItemProforma"]);
                    updated.FechaCreacion = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaCreacion"]);
                    updated.FechaModificacion = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaModificacion"]);
                }

                if (reader.NextResult())
                {
                    while (await reader.ReadAsync())
                        respuesta = manejarRespuesta(reader); // B043
                }

                respuesta.Resultado.Add(updated);
                return respuesta;
            }
            catch (Exception e) { Close(); throw e; }
            finally { Close(); }
        }

        public async Task<DTO_Respuesta> ObtenerItemsProforma(DTO_Proforma proforma)
        {
            respuesta = new DTO_Respuesta();
            var lista = new List<DTO_ProformaItem>();
            try
            {
                using var cmd = new SqlCommand("CORE.SP_ObtenerItemsProforma", GetObjConexion())
                { CommandType = CommandType.StoredProcedure };

                cmd.Parameters.Add("@ID_Proforma", SqlDbType.Int).Value = proforma.ID_Proforma;

                Open();
                using var reader = await cmd.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var it = new DTO_ProformaItem
                    {
                        ID_ProformaItem = UTL_DBHelper.ReadNullSafeInt(reader["ID_ProformaItem"]),
                        ID_Proforma = UTL_DBHelper.ReadNullSafeInt(reader["ID_Proforma"]),
                        Estado = new DTO_Estado
                        {
                            ID_Estado = UTL_DBHelper.ReadNullSafeInt(reader["ID_Estado"]),
                            Nombre = UTL_DBHelper.ReadNullSafeString(reader["EstadoNombre"])
                        },
                        NombreItemProforma = UTL_DBHelper.ReadNullSafeString(reader["NombreItemProforma"]),
                        DescripcionItemProforma = UTL_DBHelper.ReadNullSafeString(reader["DescripcionItemProforma"]),
                        PrecioItemProforma = UTL_DBHelper.ReadNullSafeDecimal(reader["PrecioItemProforma"]),
                        CantidadItemProforma = UTL_DBHelper.ReadNullSafeDecimal(reader["CantidadItemProforma"]),
                        FechaCreacion = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaCreacion"]),
                        FechaModificacion = UTL_DBHelper.ReadNullSafeDateTime(reader["FechaModificacion"])
                    };
                    lista.Add(it);
                }

                if (reader.NextResult())
                {
                    while (await reader.ReadAsync())
                        respuesta = manejarRespuesta(reader); // B048
                }

                respuesta.Resultado.Add(lista);
                return respuesta;
            }
            catch (Exception e) { Close(); throw e; }
            finally { Close(); }
        }
    }
}
