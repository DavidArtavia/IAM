
USE [IAMDB]
GO -- Crear stub si no existe
	IF OBJECT_ID('[CORE].[SP_actualizarCliente]', 'P') IS NULL BEGIN EXEC(
		'CREATE PROCEDURE [CORE].[SP_actualizarCliente] AS BEGIN SET NOCOUNT ON; END'
	)
END
GO -- =============================================
	-- Autor: David Artavia Arias
	-- Fecha: 17/06/2025
	-- Descripción: Actualiza un cliente validando que pertenezca al usuario actual
	-- =============================================
	ALTER PROCEDURE [CORE].[SP_actualizarCliente] 
	@ID_Cliente INT,
	@ID_Usuario INT,
	@ID_Estado INT = NULL AS BEGIN SET NOCOUNT ON;
	@NombreCliente VARCHAR(100),
	@ApellidoCliente VARCHAR(100),
	@TelefonoCliente VARCHAR(15),
	@CorreoCliente NVARCHAR(50) AS BEGIN
SET NOCOUNT ON;
-- Actualizar datos del cliente si pertenece al usuario
UPDATE [CORE].[TBL_CLIENTES]
SET [NombreCliente] = @NombreCliente,
    [ID_Estado] = ISNULL(@ID_Estado, [ID_Estado]),
	[ApellidoCliente] = @ApellidoCliente,
	[TelefonoCliente] = @TelefonoCliente,
	[CorreoCliente] = @CorreoCliente
WHERE [ID_Cliente] = @ID_Cliente
	AND [ID_Usuario] = @ID_Usuario;
-- Alerta de éxito
SELECT [COD_ALERTA],
	[Nombre],
	[Mensaje],
	[Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B029';
END

-- Este es el viejo lo dejo por si hay que restaurar algo ⬇️
-- =============================================
-- USE [IAMDB]
-- GO
-- IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'CORE.SP_actualizarCliente')
-- BEGIN
-- 	EXEC('CREATE PROCEDURE CORE.SP_actualizarCliente AS BEGIN SET NOCOUNT ON; END ')
-- END
-- GO
-- -- =============================================
-- -- Autor: Danny Cantillano Arias
-- -- Creaci�n: 04/05/2025
-- -- Descripci�n: Procedimiento para actualizar un cliente existente
-- -- =============================================
-- ALTER PROCEDURE CORE.SP_actualizarCliente
-- 	@ID_Cliente INT,
-- 	@NombreCliente VARCHAR(100),
-- 	@ApellidoCliente VARCHAR(100),
-- 	@TelefonoCliente VARCHAR(15),
-- 	@CorreoCliente NVARCHAR(50)
-- AS
-- BEGIN
-- 	UPDATE [CORE].[TBL_CLIENTES]
-- 	   SET [NombreCliente] = @NombreCliente,
-- 		   [ApellidoCliente] = @ApellidoCliente,
-- 		   [TelefonoCliente] = @TelefonoCliente,
-- 		   [CorreoCliente] = @CorreoCliente
-- 	 WHERE [ID_Cliente] = @ID_Cliente
-- END
-- -- NOTA: seria correcto validar el id_Usuario para solo permitir
-- --  actualizar clientes de ese usuario en especifico