USE [IAMDB]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Creación: 16/06/2025
    -- Descripción: Procedimiento para obtener los clientes ordenados por más recientes
    -- =============================================
    -- Crear stub si no existe
    IF OBJECT_ID('[CORE].[SP_obtenerClientes]', 'P') IS NULL EXEC(
        'CREATE PROCEDURE [CORE].[SP_obtenerClientes] AS BEGIN SET NOCOUNT ON; END'
    )
GO -- Procedimiento real
    ALTER PROCEDURE [CORE].[SP_obtenerClientes] AS BEGIN
SET NOCOUNT ON;
SELECT TOP (1000) [ID_Cliente],
    [ID_Usuario],
    [NombreCliente],
    [ApellidoCliente],
    [TelefonoCliente],
    [CorreoCliente]
FROM [CORE].[TBL_CLIENTES]
ORDER BY [ID_Cliente] DESC;
-- Más recientes
-- Alerta de éxito
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B027';
-- "Clientes obtenidos correctamente"
END