USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'CORE.SP_ActualizarCliente')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_ActualizarCliente AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 04/05/2025
-- Descripción: Procedimiento para actualizar un cliente existente
-- =============================================
ALTER PROCEDURE CORE.SP_ActualizarCliente
	@ID_Cliente INT,
	@NombreCliente VARCHAR(100),
	@ApellidoCliente VARCHAR(100),
	@TelefonoCliente VARCHAR(15),
	@CorreoCliente NVARCHAR(50)
AS
BEGIN
	UPDATE [CORE].[TBL_CLIENTES]
	   SET [NombreCliente] = @NombreCliente,
		   [ApellidoCliente] = @ApellidoCliente,
		   [TelefonoCliente] = @TelefonoCliente,
		   [CorreoCliente] = @CorreoCliente
	 WHERE [ID_Cliente] = @ID_Cliente
END
