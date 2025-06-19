USE [IAMDB]
GO

-- Crear stub si no existe
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_obtenerItemOrdenDeServicio')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_obtenerItemOrdenDeServicio AS BEGIN SET NOCOUNT ON; END ')
END
GO

-- =============================================
-- Autor: Danny Cantillano
-- Fecha: 18/06/2025
-- Descripción: Obtiene los items de una orden de servicio
-- =============================================
ALTER PROCEDURE CORE.SP_obtenerItemOrdenDeServicio
	@ID_OrdenServicio INT
AS
BEGIN
	SELECT [ID_ItemOrdenServicio]
		  ,[ID_OrdenServicio]
		  ,ESTADO.[ID_Estado]
		  ,[NombreItemOrdenServicio]
		  ,[Descripcion]
		  ,[Monto]
		  ,[Avance]
		  ,ESTADO.Nombre EstadoNombre
	  FROM [CORE].[TBL_ITEMS_ORDEN_SERVICIO] ITEM
	  INNER JOIN [UTIL].[TBL_ESTADOS] ESTADO ON ITEM.ID_Estado = ESTADO.ID_Estado

	  WHERE ID_OrdenServicio = @ID_OrdenServicio

	-- Alerta de éxito
	SELECT [COD_ALERTA], [Nombre], [Mensaje], [Tipo]
	FROM [UTIL].[TBL_ALERTAS]
	WHERE [COD_ALERTA] = 'A028';
END
