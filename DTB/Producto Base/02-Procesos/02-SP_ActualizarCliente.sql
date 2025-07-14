 USE [IAMDB]
 GO
 IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_actualizarCliente')
 BEGIN
 	EXEC('CREATE PROCEDURE CORE.SP_actualizarCliente AS BEGIN SET NOCOUNT ON; END ')
 END
 GO
 -- =============================================
 -- Autor: Danny Cantillano Arias
 -- Creaci�n: 04/05/2025
 -- Descripci�n: Procedimiento para actualizar un cliente existente
 -- =============================================
 ALTER PROCEDURE CORE.SP_actualizarCliente
 	@ID_Cliente INT,
	@ID_Estado INT = NULL,
 	@NombreCliente VARCHAR(100),
 	@ApellidoCliente VARCHAR(100),
 	@TelefonoCliente VARCHAR(15),
 	@CorreoCliente NVARCHAR(50)
 AS
 BEGIN
 	UPDATE [CORE].[TBL_CLIENTES]
 	   SET [NombreCliente] = @NombreCliente,
		   [ID_Estado] = ISNULL(@ID_Estado, [ID_Estado]),
 		   [ApellidoCliente] = @ApellidoCliente,
 		   [TelefonoCliente] = @TelefonoCliente,
 		   [CorreoCliente] = @CorreoCliente
 	 WHERE [ID_Cliente] = @ID_Cliente
 
-- Alerta de éxito
SELECT [COD_ALERTA],
	[Nombre],
	[Mensaje],
	[Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B029';
END