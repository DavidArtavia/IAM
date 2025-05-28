USE [IAMDB]
GO
    /****** Object:  StoredProcedure [CORE].[SP_registrarOrdenServicio]    Script Date: 27/5/2025 12:14:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor:       David Artavia Arias
    -- Creación:    2025-05-26
    -- Descripción: Registra una nueva orden de servicio,
    --              capturando FechaOrdenServicio con GETDATE() y permitiendo NULL en algunos elementos.
    -- =============================================
    IF OBJECT_ID(N'[CORE].[SP_registrarOrdenServicio]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [CORE].[SP_registrarOrdenServicio]
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
    ALTER PROCEDURE [CORE].[SP_registrarOrdenServicio] @ID_Cliente INT,
    @ID_Negocio INT,
    @ID_Estado INT,
    @FechaEstimadaEntrega DATETIME = NULL,
    @FechaInicio DATETIME = NULL,
    -- Acepta NULL
    @FechaFinal DATETIME = NULL,
    -- Acepta NULL
    @FechaEntrega DATETIME = NULL,
    @ReferenciaJSON NVARCHAR(MAX) = NULL,
    @NotaOrdenServicio VARCHAR(255) = NULL AS BEGIN
SET NOCOUNT ON;
-- 1) Validar existencia de Cliente
IF NOT EXISTS (
    SELECT 1
    FROM [CORE].[TBL_CLIENTES]
    WHERE [ID_Cliente] = @ID_Cliente
) BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B019';
RETURN;
END -- 2) Validar existencia de Negocio
IF NOT EXISTS (
    SELECT 1
    FROM [CORE].[TBL_NEGOCIOS]
    WHERE [ID_Negocio] = @ID_Negocio
) BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B020';
RETURN;
END -- 3) Validar existencia de Estado
IF NOT EXISTS (
    SELECT 1
    FROM [UTIL].[TBL_ESTADOS]
    WHERE [ID_Estado] = @ID_Estado
) BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B021';
RETURN;
END -- 4) Insertar nueva orden de servicio
INSERT INTO [CORE].[TBL_ORDENES_SERVICIO] (
        [ID_Cliente],
        [ID_Negocio],
        [ID_Estado],
        [FechaOrdenServicio],
        [FechaEstimadaEntrega],
        [FechaInicio],
        [FechaFinal],
        [FechaEntrega],
        [ReferenciaJSON],
        [NotaOrdenServicio]
    )
VALUES (
        @ID_Cliente,
        @ID_Negocio,
        @ID_Estado -- PUEDE SER 6 (Activo) por defecto
,
        GETDATE(),
        @FechaEstimadaEntrega,
        @FechaInicio -- puede ser NULL
,
        @FechaFinal -- puede ser NULL
,
        @FechaEntrega,
        @ReferenciaJSON,
        @NotaOrdenServicio
    );
-- 5) Verificar filas afectadas
IF @@ROWCOUNT = 0 BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B022';
RETURN;
END -- 6) Todo correcto
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B018';
END