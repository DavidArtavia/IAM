USE [IAMDB]
GO

-- Crear stub si no existe
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_actualizarItemOrdenDeServicio')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_actualizarItemOrdenDeServicio AS BEGIN SET NOCOUNT ON; END ')
END
GO

-- =============================================
-- Autor: Danny Cantillano
-- Fecha: 18/06/2025
-- Descripción: Guarda un nuevo item a una orden de servicio previamente creada (A un item de la orden de servicio no se le puede cambiar
-- la orden de servicio. se puede eliminar y crear una nueva en otro lugar)
-- =============================================
ALTER PROCEDURE CORE.SP_actualizarItemOrdenDeServicio
	@ID_ItemOrdenServicio INT,
    @NombreItemOrdenServicio VARCHAR(100),
    @Descripcion VARCHAR(255) = NULL,
	@Monto DECIMAL(16,3),
	@Avance int,
	@ID_Estado int
AS
BEGIN

	UPDATE [CORE].[TBL_ITEMS_ORDEN_SERVICIO]
	   SET [ID_Estado] = @ID_Estado
		  ,[NombreItemOrdenServicio] = @NombreItemOrdenServicio
		  ,[Descripcion] = @Descripcion
		  ,[Monto] = @Monto
		  ,[Avance] = @Avance
	 WHERE ID_ItemOrdenServicio = @ID_ItemOrdenServicio



	-- Alerta de éxito
	SELECT [COD_ALERTA], [Nombre], [Mensaje], [Tipo]
	FROM [UTIL].[TBL_ALERTAS]
	WHERE [COD_ALERTA] = 'A027';
END
