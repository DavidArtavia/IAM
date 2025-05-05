USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'CORE.SP_ConsultarClientesPorUsuario')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_ConsultarClientesPorUsuario AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 04/05/2025
-- Descripción: Procedimiento para consultar clientes por ID_Usuario
-- =============================================
ALTER PROCEDURE CORE.SP_ConsultarClientesPorUsuario
	@ID_Usuario INT
AS
BEGIN
	SELECT [ID_Cliente],
		   [NombreCliente],
		   [ApellidoCliente],
		   [TelefonoCliente],
		   [CorreoCliente]
	  FROM [CORE].[TBL_CLIENTES]
	 WHERE [ID_Usuario] = @ID_Usuario
END
