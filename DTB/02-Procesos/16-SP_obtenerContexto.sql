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
	SELECT @NumContextos + 1 ID_CONTEXTO, 'CONTEXTO PERSONALIZADO' Nombre, 'system' TIPO, 'DATOS DE CONTEXTO INICIAL: \n• ' +
	'ID_Usuario = ' + CONVERT(VARCHAR, NEGOCIO.ID_Usuario) + ' \n• ' +
	'ID_Negocio = ' + CONVERT(VARCHAR,NEGOCIO.ID_Negocio) + ' \n• ' + 
	'ID_Estado (El de la orden de servicio) = 6 \n• ' + 
	'ID_ChatIA = ' + CONVERT(VARCHAR,CHAT.ID_ChatIA) + '\nEstos valores se reciben desde el inicio y pueden usarse en todos los esquemas que soliciten estos campos; **no debes solicitarlos ni mostrarlos al usuario.** **deben cargarse en Parametros siempre que se ejecuten acciones en el bakend**' Prompt
	FROM [CORE].[TBL_NEGOCIOS] NEGOCIO
	INNER JOIN  [CORE].[TBL_CHAT_IA] CHAT ON CHAT.ID_Negocio = NEGOCIO.ID_Negocio
	WHERE CHAT.ID_ChatIA = @IdChat
	UNION ALL
	SELECT @NumContextos + 2 ID_CONTEXTO, 'CONTEXTO PERSONALIZADO' Nombre, 'system' TIPO, 'DATOS DE CONTEXTO INICIAL: \n• ' +
	'ReferenciaJSON = ' + NEGOCIO.ReferenciaJSON + ' \n• ' +
	'\nEstos valores se deben solicitar si el usuario quiere crear/buscar/editar/eliminar una orden de servicio y la cantidad de registros de este JSON siempre debe ser la misma en (la estructura no cambia aunque los valores si)' Prompt
	FROM [CORE].[TBL_NEGOCIOS] NEGOCIO
	INNER JOIN  [CORE].[TBL_CHAT_IA] CHAT ON CHAT.ID_Negocio = NEGOCIO.ID_Negocio
	WHERE CHAT.ID_ChatIA = @IdChat
	UNION ALL
	SELECT @NumContextos + 3 ID_CONTEXTO, 'CONTEXTO PERSONALIZADO' Nombre, 'system' TIPO, 'DATOS DE CONTEXTO INICIAL: \n• ' +
	'Fecha Actual = ' + FORMAT(GETDATE(), 'dd/MM/yyyy') + ' En caso de tener que hacer calculos sobre la fecha, esta sería la fecha actual para dichos calculos \n• '  Prompt
	FROM [CORE].[TBL_NEGOCIOS] NEGOCIO
	INNER JOIN  [CORE].[TBL_CHAT_IA] CHAT ON CHAT.ID_Negocio = NEGOCIO.ID_Negocio
	WHERE CHAT.ID_ChatIA = @IdChat

    SELECT  [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS]WHERE [COD_ALERTA] = 'A0023';
END
GO


