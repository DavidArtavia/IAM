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
AS
BEGIN
    SELECT  [ID_CONTEXTO],
            [Nombre],
            [Tipo],
            [Prompt]
    FROM    [SECU].[TBL_CONTEXTO];


    SELECT  [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS]WHERE [COD_ALERTA] = 'A0023';
END
GO
