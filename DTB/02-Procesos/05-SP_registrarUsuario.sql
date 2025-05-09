USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SECU.SP_registrarUsuario')
BEGIN
	EXEC('CREATE PROCEDURE SECU.SP_registrarUsuario AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 07/05/2025
-- Descripción: Procedimiento para registrar un usuario (se utiliza en la página de registro del sistema)
-- =============================================
ALTER PROCEDURE SECU.SP_registrarUsuario
           @NombreUsuario VARCHAR(100),
           @Apellido VARCHAR(100),
           @TelefonoUsuario VARCHAR(15),
           @CorreoUsuario NVARCHAR(50),
           @Pass NVARCHAR(255)
AS
BEGIN


    IF EXISTS (SELECT 1 FROM [SECU].[TBL_USUARIOS] WHERE [CorreoUsuario] = @CorreoUsuario)
    BEGIN
        -- Correo ya existe
		SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A002'
    END
	ELSE
	BEGIN
		-- Si el correo no existe, proceder con la inserción
		INSERT INTO [SECU].[TBL_USUARIOS]
				   ([ID_Estado]
				   ,[ID_Rol]
				   ,[NombreUsuario]
				   ,[Apellido]
				   ,[TelefonoUsuario]
				   ,[CorreoUsuario]
				   ,[Pass])
		VALUES
				   (1
				   ,1
				   ,@NombreUsuario
				   ,@Apellido
				   ,@TelefonoUsuario
				   ,@CorreoUsuario
				   ,@Pass)
	SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A001'
	END
END

GO

