USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'CORE.SP_GuardarCliente')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_GuardarCliente AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 04/05/2025
-- Descripción: Procedimiento para guardar un cliente nuevo
-- =============================================
ALTER PROCEDURE CORE.SP_GuardarCliente
			@ID_Usuario INT,
            @NombreCliente VARCHAR(100),
            @ApellidoCliente VARCHAR(100),
			@TelefonoCliente VARCHAR(15),
			@CorreoCliente NVARCHAR(50)
AS
BEGIN
	INSERT INTO [CORE].[TBL_CLIENTES]
			   ([ID_Usuario]
			   ,[NombreCliente]
			   ,[ApellidoCliente]
			   ,[TelefonoCliente]
			   ,[CorreoCliente])
		 VALUES
			   (@ID_Usuario
			   ,@NombreCliente
			   ,@ApellidoCliente
			   ,@TelefonoCliente
			   ,@CorreoCliente)

END