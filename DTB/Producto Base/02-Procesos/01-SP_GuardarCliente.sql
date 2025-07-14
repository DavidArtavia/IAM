USE [IAMDB]
GO

-- Crear stub si no existe
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_guardarCliente')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_guardarCliente AS BEGIN SET NOCOUNT ON; END ')
END
GO

-- =============================================
-- Autor: David Artavia Arias
-- Fecha: 17/06/2025
-- Descripción: Guarda un nuevo cliente asignando estado "Activo" (ID 16) por defecto
-- =============================================
ALTER PROCEDURE CORE.SP_guardarCliente
	@ID_Usuario INT,
    @NombreCliente VARCHAR(100),
    @ApellidoCliente VARCHAR(100),
	@TelefonoCliente VARCHAR(15),
	@CorreoCliente NVARCHAR(50)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID_Estado INT = 16; -- Estado "Activo" por defecto

	INSERT INTO [CORE].[TBL_CLIENTES] (
		ID_Usuario,
		NombreCliente,
		ApellidoCliente,
		TelefonoCliente,
		CorreoCliente,
		ID_Estado
	)
	OUTPUT 
		inserted.ID_Cliente,
		inserted.ID_Usuario,
		inserted.NombreCliente,
		inserted.ApellidoCliente,
		inserted.TelefonoCliente,
		inserted.CorreoCliente,
		inserted.ID_Estado
	VALUES (
		@ID_Usuario,
		@NombreCliente,
		@ApellidoCliente,
		@TelefonoCliente,
		@CorreoCliente,
		@ID_Estado
	);

	-- Alerta de éxito
	SELECT [COD_ALERTA], [Nombre], [Mensaje], [Tipo]
	FROM [UTIL].[TBL_ALERTAS]
	WHERE [COD_ALERTA] = 'A0024';
END
