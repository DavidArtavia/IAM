USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_obtenerChats')
BEGIN
    EXEC('CREATE PROCEDURE CORE.SP_obtenerChats AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 13/05/2025
-- Descripción: Procedimiento para obtener los chats de un negocio
-- =============================================
ALTER PROCEDURE CORE.SP_obtenerChats
    @ID_Negocio INT
AS
BEGIN
		SELECT [ID_ChatIA]
				,[ID_Negocio]
				,ESTADO.[ID_Estado]
				,ESTADO.Nombre
				,[FechaInicial]
				,[FechaFinal]
			FROM [CORE].[TBL_CHAT_IA] CHAT INNER JOIN [UTIL].[TBL_ESTADOS] ESTADO ON CHAT.ID_Estado = ESTADO.ID_Estado
			WHERE CHAT.ID_Negocio = @ID_Negocio

		SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0021'

END
GO
