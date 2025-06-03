USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_guardarMensaje')
BEGIN
    EXEC('CREATE PROCEDURE CORE.SP_guardarMensaje AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 12/05/2025
-- Descripción: Procedimiento para guardar mensajes de chat
-- =============================================
ALTER PROCEDURE CORE.SP_guardarMensaje
    @ID_ChatIA INT,
    @Envia NVARCHAR(15),
	@Recibe NVARCHAR(15),
    @Contenido NVARCHAR(MAX),
	@Parametros NVARCHAR(MAX) = NULL,
    @RutaAudio NVARCHAR(500) = '' -- Ruta del archivo de audio si existe
AS
BEGIN
INSERT INTO [CORE].[TBL_MENSAJES_CHAT]
           ([ID_ChatIA]
           ,[Envia]
           ,[Recibe]
           ,[Contenido]
           ,[Parametros]
           ,[RutaAudio]
           ,[FechaMensaje])
	OUTPUT (
	inserted.ID_Mensaje
	)
     VALUES
           (@ID_ChatIA,
            @Envia,
            @Recibe, 
            @Contenido,
            @Parametros,
            @RutaAudio, 
            GETDATE())

			SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0014'

END

