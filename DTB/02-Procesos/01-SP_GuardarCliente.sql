USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_guardarCliente')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_guardarCliente AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 27/05/2025
-- Descripción: Procedimiento para guardar un cliente nuevo
-- =============================================
ALTER PROCEDURE CORE.SP_guardarCliente
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

			   SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0024'

END

