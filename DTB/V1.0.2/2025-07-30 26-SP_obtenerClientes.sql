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
    ALTER PROCEDURE [CORE].[SP_obtenerClientes] @ID_Usuario INT AS BEGIN
SET NOCOUNT ON;
SELECT C.ID_Cliente,
    C.ID_Usuario,
    C.ID_Estado,
    E.Nombre AS EstadoNombre,
    C.NombreCliente,
    C.ApellidoCliente,
    C.TelefonoCliente,
    C.CorreoCliente
FROM [CORE].[TBL_CLIENTES] C
    INNER JOIN [UTIL].[TBL_ESTADOS] E ON C.ID_Estado = E.ID_Estado
WHERE C.ID_Usuario = @ID_Usuario
ORDER BY C.ID_Cliente DESC;
-- Alerta de éxito
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B030';
-- "Clientes obtenidos correctamente"
END
GO

