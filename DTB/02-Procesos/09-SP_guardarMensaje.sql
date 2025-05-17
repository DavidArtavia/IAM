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
    @Tipo NVARCHAR(10), 
    @TextoMensaje NVARCHAR(2500) = NULL,
    @TranscripcionAudio NVARCHAR(2500) = NULL, -- Si es entrada por voz
    @RutaAudio NVARCHAR(500) = NULL -- Ruta del archivo de audio si existe
AS
BEGIN
    INSERT INTO [CORE].[TBL_MENSAJES_CHAT]
               ([ID_ChatIA]
               ,[Tipo]
               ,[TextoMensaje]
               ,[TranscripcionAudio]
               ,[RutaAudio]
               ,[FechaMensaje])
         VALUES
               (@ID_ChatIA,
                @Tipo,
                @TextoMensaje,
                @TranscripcionAudio,
                @RutaAudio,
                GETDATE())

				SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0014'

END
GO
