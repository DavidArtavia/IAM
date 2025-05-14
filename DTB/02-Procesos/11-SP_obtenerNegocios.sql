USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_obtenerNegocios')
BEGIN
    EXEC('CREATE PROCEDURE CORE.SP_obtenerNegocios AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 13/05/2025
-- Descripción: Procedimiento para obtener los datos de negocios por usuario
-- =============================================
ALTER PROCEDURE CORE.SP_obtenerNegocios
    @ID_Usuario INT
AS
BEGIN

				SELECT [ID_Negocio]
					  ,[ID_Usuario]
					  ,ESTADO.[ID_Estado]
					  ,ESTADO.Nombre
					  ,[NombreNegocio]
					  ,[Descripcion]
					  ,[Direccion]
					  ,[TelefonoNegocio]
					  ,[CorreoNegocio]
					  ,[FechaRegistro]
					  ,[ReferenciaJSON]
				  FROM [CORE].[TBL_NEGOCIOS] NEGOCIO INNER JOIN [UTIL].[TBL_ESTADOS] ESTADO ON NEGOCIO.ID_Estado = ESTADO.ID_Estado
				  WHERE ID_Usuario = @ID_Usuario
				
				  SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0019'

END
GO
