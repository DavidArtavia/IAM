USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_obtenerUsuarioPorId')
BEGIN
	EXEC('CREATE PROCEDURE SECU.SP_obtenerUsuarioPorId AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 13/05/2025
-- Descripción: Procedimiento para extraer el usuario por medio del ID (Se usa en el refrescamiento del token)
-- =============================================
ALTER PROCEDURE SECU.SP_obtenerUsuarioPorId
           @ID_Usuario INT
AS
BEGIN
		--Procedemos a enviar el usuario
		SELECT   [ID_Usuario]
				,[NombreUsuario]
				,[Apellido]
				,[TelefonoUsuario]
				,[CorreoUsuario]
				,'' Pass
				,ESTADO.[ID_Estado]
				,ESTADO.[Nombre]
				,ROL.[ID_Rol]
				,ROL.[NombreRol]
				,ROL.[DescripcionRol]
			FROM [SECU].[TBL_USUARIOS] USUARIO
			INNER JOIN [UTIL].[TBL_ESTADOS] ESTADO ON USUARIO.ID_Estado = ESTADO.ID_Estado
			INNER JOIN [SECU].[TBL_ROLES] ROL ON USUARIO.ID_Rol = ROL.ID_Rol
			WHERE ID_Usuario = @ID_Usuario

			IF NOT EXISTS (SELECT 1 FROM [SECU].[TBL_USUARIOS] WHERE ID_Usuario = @ID_Usuario)
			BEGIN
				SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0022'
			END
			ELSE
			BEGIN
				SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0023'
			END

END
