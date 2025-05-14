USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_obtenerMensajesChat')
BEGIN
    EXEC('CREATE PROCEDURE CORE.SP_obtenerMensajesChat AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 13/05/2025
-- Descripción: Procedimiento para obtener los mensajes de un chat
-- =============================================
ALTER PROCEDURE CORE.SP_obtenerMensajesChat
    @ID_ChatIA INT
AS
BEGIN

		SELECT [ID_Mensaje]
				,[ID_ChatIA]
				,[Tipo]
				,[TextoMensaje]
				,[TranscripcionAudio]
				,[RutaAudio]
				,[FechaMensaje]
			FROM [CORE].[TBL_MENSAJES_CHAT] WHERE ID_ChatIA = @ID_ChatIA

			SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0020'

END
GO
