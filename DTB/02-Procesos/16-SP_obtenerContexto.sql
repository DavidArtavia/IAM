USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_obtenerContexto')
BEGIN
    EXEC('CREATE PROCEDURE SECU.SP_obtenerContexto AS BEGIN SET NOCOUNT ON; END')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 15/05/2025
-- Descripción: Procedimiento para obtener los promps para agregar contexto a la IA
-- =============================================
ALTER PROCEDURE SECU.SP_obtenerContexto
	@IdChat INT,
	@IdUsuario INT
AS
BEGIN
	DECLARE @NumContextos INT
	SET @NumContextos = (SELECT COUNT(*) FROM [SECU].[TBL_CONTEXTO])

    SELECT  [ID_CONTEXTO],
            [Nombre],
            [Tipo],
            [Prompt]
    FROM    [SECU].[TBL_CONTEXTO]
	UNION ALL
	SELECT @NumContextos + 1 ID_CONTEXTO, 'CONTEXTO PERSONALIZADO' Nombre, 'system' TIPO, 'DATOS DE CONTEXTO INICIAL:\n• ' +
	'ID_Usuario = ' + CONVERT(VARCHAR, NEGOCIO.ID_Usuario) + '\n• ' +
	'ID_Negocio = ' + CONVERT(VARCHAR,NEGOCIO.ID_Negocio) + '\n• ' + 
	'ID_ChatIA = ' + CONVERT(VARCHAR,CHAT.ID_ChatIA) + '\nEstos valores se reciben desde el inicio y pueden usarse cuando sea necesario; **no debes solicitarlos al usuario.**'
	FROM [CORE].[TBL_NEGOCIOS] NEGOCIO
	INNER JOIN  [CORE].[TBL_CHAT_IA] CHAT ON CHAT.ID_Negocio = NEGOCIO.ID_Negocio
	WHERE CHAT.ID_ChatIA = 3

    SELECT  [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS]WHERE [COD_ALERTA] = 'A0023';
END
GO


