USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_validarRefreshToken')
BEGIN
	EXEC('CREATE PROCEDURE SECU.SP_validarRefreshToken AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 12/05/2025
-- Descripción: Procedimiento revalidar una sesión cuando se vence el acces token
-- =============================================
ALTER PROCEDURE SECU.SP_validarRefreshToken
			@ID_Usuario INT,
			@RefreshToken NVARCHAR(255)
AS
BEGIN

	--Lo primero es validar que el Refresh token pertenece al usuario
	IF NOT EXISTS (SELECT 1 FROM [SECU].[TBL_SESIONES] WHERE ID_Usuario = @ID_Usuario AND RefreshToken = @RefreshToken)
		BEGIN
			--No coincide (Lo devuelve al login)
			SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0015'
		END
	ELSE 
	--Validamos que el usuario esté activo (Lo devuelve al login)
	IF NOT EXISTS (SELECT 1 FROM [SECU].[TBL_USUARIOS] USUARIO INNER JOIN [UTIL].[TBL_ESTADOS] ESTADO ON USUARIO.ID_Estado = ESTADO.ID_Estado WHERE USUARIO.ID_Usuario = @ID_Usuario AND ESTADO.Nombre = 'Activo')
		BEGIN
			--Significa que el usuario está desactivado
			SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A005'
		END
	ELSE
	--Validamos que el refresh token no esté revocado (Lo devuelve al login)
	IF NOT EXISTS (SELECT 1 FROM [SECU].[TBL_SESIONES] WHERE RefreshToken = @RefreshToken AND Revocado = 0)
		BEGIN
			--Si el refresh token fue revocado
			SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0016'
		END
	ELSE
	--Validamos que el refresh token no esté vencido
	IF NOT EXISTS (SELECT 1 FROM [SECU].[TBL_SESIONES] WHERE RefreshToken = @RefreshToken AND FechaExpiracion < GETDATE())
		BEGIN
			--El token está vencido pero como se llegó hasta esta validación pasando todos los otros filtros, se puede generar uno nuevo.
			SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0018' 
		END
	ELSE
		BEGIN
			--Si pasó todos los filtros es porque es un token válido
			SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0017'
		END


	
    
END

GO

