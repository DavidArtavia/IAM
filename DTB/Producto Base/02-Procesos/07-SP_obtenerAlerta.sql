USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_obtenerAlerta')
BEGIN
	EXEC('CREATE PROCEDURE UTIL.SP_obtenerAlerta AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 08/05/2025
-- Descripción: Procedimiento para Obtener una alerta y mostrarla al usuario
-- =============================================
ALTER PROCEDURE UTIL.SP_obtenerAlerta
           @COD_ALERTA VARCHAR(10)
AS
BEGIN

SELECT [COD_ALERTA]
      ,[Nombre]
      ,[Mensaje]
      ,[Tipo]
  FROM [UTIL].[TBL_ALERTAS]
  WHERE COD_ALERTA = @COD_ALERTA


END
