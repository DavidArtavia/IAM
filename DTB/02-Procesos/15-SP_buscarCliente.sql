USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_buscarCliente')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_buscarCliente AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 15/05/2025
-- Descripción: Procedimiento para buscar un cliente (lo usa la IA cuando ocupa agregar un cliente nuevo para saber si existe)
-- =============================================
ALTER PROCEDURE CORE.SP_buscarCliente
           @NombreCliente NVARCHAR(50) = '',
		   @ApellidoCliente NVARCHAR = '',
		   @TelefonoCliente NVARCHAR = '',
		   @CorreoCliente NVARCHAR = ''
AS
BEGIN

	SELECT [ID_Cliente]
		  ,[ID_Usuario]
		  ,[NombreCliente]
		  ,[ApellidoCliente]
		  ,[TelefonoCliente]
		  ,[CorreoCliente]
	  FROM [CORE].[TBL_CLIENTES]
	  WHERE 
	  [NombreCliente] LIKE '%' + @NombreCliente + '%' OR
	  [ApellidoCliente] LIKE '%' + @ApellidoCliente + '%' OR
	  [TelefonoCliente] LIKE '%' + @TelefonoCliente + '%' OR
	  [CorreoCliente] LIKE '%' + @CorreoCliente + '%' 

	  SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo] FROM [UTIL].[TBL_ALERTAS] WHERE [COD_ALERTA] = 'A0022'
   
END
