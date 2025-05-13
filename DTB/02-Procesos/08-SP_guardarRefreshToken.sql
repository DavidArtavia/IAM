USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_guardarRefreshToken')
BEGIN
	EXEC('CREATE PROCEDURE SECU.SP_guardarRefreshToken AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 09/05/2025
-- Descripción: Procedimiento para guardar el refresh token
-- =============================================
ALTER PROCEDURE SECU.SP_guardarRefreshToken
			@ID_Usuario INT,
			@RefreshToken NVARCHAR(255),
			@FechaExpiracion DATETIME,
			@UserAgent NVARCHAR(255) = NULL, 
			@IPUsuario NVARCHAR(45) = NULL,
			@ReemplazadoPorToken NVARCHAR(255) = NULL
AS
BEGIN

INSERT INTO [SECU].[TBL_SESIONES]
           ([ID_Usuario]
           ,[RefreshToken]
           ,[FechaExpiracion]
           ,[Revocado]
           ,[FechaRevocado]
           ,[ReemplazadoPorToken]
           ,[UserAgent]
           ,[IPUsuario])
     VALUES
           (@ID_Usuario,
			@RefreshToken,
			@FechaExpiracion,
			0,
			NULL,
			NULL,
			@UserAgent, 
			@IPUsuario)

	SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A007' 
    
END

GO

