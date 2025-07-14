USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'CORE.SP_EliminarCliente')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_EliminarCliente AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 04/05/2025
-- Descripción: Procedimiento para eliminar un cliente por ID
-- =============================================
ALTER PROCEDURE CORE.SP_EliminarCliente
	@ID_Cliente INT
AS
BEGIN
	DELETE FROM [CORE].[TBL_CLIENTES]
	WHERE [ID_Cliente] = @ID_Cliente
END
