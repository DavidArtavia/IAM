USE [IAMDB]
GO
    /****** Object:  StoredProcedure [CORE].[SP_actualizarOrdenServicio]    Script Date: 27/5/2025 12:22:05 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor:       David Artavia Arias
    -- Creación:    2025-05-26
    -- Descripción: Actualiza una orden de servicio en CORE.TBL_ORDENES_SERVICIO,
    --              usando parámetros opcionales y preservando fechas nulas.
    -- =============================================
    IF OBJECT_ID(N'[CORE].[SP_actualizarOrdenServicio]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [CORE].[SP_actualizarOrdenServicio]
        AS
        BEGIN
            SET NOCOUNT ON;
        END
    '
    );
END
GO -- =============================================
    -- Definición real del SP
    -- =============================================
    ALTER PROCEDURE [CORE].[SP_actualizarOrdenServicio] @ID_OrdenServicio INT,
    @ID_Estado INT = NULL,
    @FechaEstimadaEntrega DATETIME = NULL,
    @FechaInicio DATETIME = NULL,
    @FechaFinal DATETIME = NULL,
    @FechaEntrega DATETIME = NULL,
    @ReferenciaJSON NVARCHAR(MAX) = NULL,
    @NotaOrdenServicio VARCHAR(255) = NULL AS BEGIN
SET NOCOUNT ON;
-- 1) Validar existencia de la orden
IF NOT EXISTS (
    SELECT 1
    FROM [CORE].[TBL_ORDENES_SERVICIO]
    WHERE [ID_OrdenServicio] = @ID_OrdenServicio
) BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B024';
-- Orden no existe
RETURN;
END -- 2) Ejecutar UPDATE con parámetros opcionales
UPDATE [CORE].[TBL_ORDENES_SERVICIO]
SET [ID_Estado] = ISNULL(@ID_Estado, [ID_Estado]),
    [FechaEstimadaEntrega] = @FechaEstimadaEntrega,
    -- puede ser NULL
    [FechaInicio] = @FechaInicio,
    -- puede ser NULL
    [FechaFinal] = @FechaFinal,
    -- puede ser NULL
    [FechaEntrega] = @FechaEntrega,
    -- puede ser NULL
    [ReferenciaJSON] = ISNULL(@ReferenciaJSON, [ReferenciaJSON]),
    [NotaOrdenServicio] = ISNULL(@NotaOrdenServicio, [NotaOrdenServicio])
WHERE [ID_OrdenServicio] = @ID_OrdenServicio;
-- 3) Verificar filas afectadas
IF @@ROWCOUNT = 0 BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B025';
-- Sin cambios
RETURN;
END -- 4) Éxito
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B023';
-- Actualización exitosa
END