USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_obtenerUsuario')
BEGIN
	EXEC('CREATE PROCEDURE SECU.SP_obtenerUsuario AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 08/05/2025
-- Descripción: Procedimiento para autentiar un usuario (se utiliza en la página de login del sistema)
-- =============================================
ALTER PROCEDURE SECU.SP_obtenerUsuario
           @CorreoUsuario NVARCHAR(50)
AS
BEGIN

    IF NOT EXISTS (SELECT 1 FROM [SECU].[TBL_USUARIOS] WHERE [CorreoUsuario] = @CorreoUsuario)
    BEGIN
        -- Correo no encontrado
		SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A003'
    END
	ELSE IF EXISTS (
						SELECT 1 FROM [SECU].[TBL_USUARIOS] USUARIO
						INNER JOIN [UTIL].[TBL_ESTADOS] ESTADO ON USUARIO.ID_Estado = ESTADO.ID_Estado
						WHERE [CorreoUsuario] = @CorreoUsuario AND ESTADO.Nombre = 'Inactivo'
					)
    BEGIN
		--Usuario Inactivo
		SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A005'
	END
	ELSE
	BEGIN
		--Procedemos a enviar el mensaje 
		SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A004'
		--Procedemos a enviar el usuario
		SELECT   [ID_Usuario]
				,[NombreUsuario]
				,[Apellido]
				,[TelefonoUsuario]
				,[CorreoUsuario]
				,[Pass]
				,ESTADO.[ID_Estado]
				,ESTADO.[Nombre]
				,ROL.[ID_Rol]
				,ROL.[NombreRol]
				,ROL.[DescripcionRol]
			FROM [SECU].[TBL_USUARIOS] USUARIO
			INNER JOIN [UTIL].[TBL_ESTADOS] ESTADO ON USUARIO.ID_Estado = ESTADO.ID_Estado
			INNER JOIN [SECU].[TBL_ROLES] ROL ON USUARIO.ID_Rol = ROL.ID_Rol
			WHERE [CorreoUsuario] = @CorreoUsuario

	END
END
