USE [IAMDB]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Creación: 25/06/2025
    -- Descripción: Obtener transacciones de un negocio por su ID
    -- =============================================
	GO -- Stub: Crear procedimiento si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM sys.procedures
        WHERE name = 'SP_obtenerTransacciones'
    ) BEGIN EXEC(
        'CREATE PROCEDURE [CORE].[SP_obtenerTransacciones] AS BEGIN SET NOCOUNT ON; END'
    )
END
GO
    ALTER PROCEDURE [CORE].[SP_obtenerTransacciones] @ID_Negocio INT AS BEGIN
SET NOCOUNT ON;
SELECT TRANS.ID_Transaccion,
    TRANS.ID_Negocio,
    ESTADO.ID_Estado AS Estado_ID_Estado,
    ESTADO.Nombre AS NombreEstado,
    TRANS.Concepto,
    TRANS.Monto,
    TRANS.Tipo,
    TRANS.NumReferencia,
    TRANS.TipoNumReferencia,
    TRANS.FechaTransaccion
FROM CORE.TBL_TRANSACCIONES TRANS
    INNER JOIN UTIL.TBL_ESTADOS ESTADO ON TRANS.ID_Estado = ESTADO.ID_Estado
WHERE TRANS.ID_Negocio = @ID_Negocio
ORDER BY TRANS.ID_Transaccion DESC;
-- Alerta de éxito
SELECT COD_ALERTA,
    Nombre,
    Mensaje,
    Tipo
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = 'B033';
-- Transacciones cargadas correctamente
END
GO