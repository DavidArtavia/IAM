USE [IAMDB]
GO
    /****** Object:  StoredProcedure [CORE].[SP_registrarCuentaPorPagar]    Script Date: 27/5/2025 12:08:01 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor:       David Artavia Arias
    -- Creación:    2025-05-26
    -- Descripción: Registra una nueva cuenta por pagar,
    --              capturando FechaInicial con el timestamp actual y estado fijo = 5.
    -- =============================================
    IF OBJECT_ID(N'[CORE].[SP_registrarCuentaPorPagar]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [CORE].[SP_registrarCuentaPorPagar]
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
    ALTER PROCEDURE [CORE].[SP_registrarCuentaPorPagar] @ID_Negocio INT,
    @Concepto VARCHAR(50),
    @Descripcion VARCHAR(255),
    @Saldo DECIMAL(16, 3) AS BEGIN
SET NOCOUNT ON;
-- 1) Validar existencia de Negocio
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
WHERE [COD_ALERTA] = 'B009';
-- Negocio no existe
RETURN;
END -- 2) Validar existencia de Estado
IF NOT EXISTS (
    SELECT 1
    FROM [UTIL].[TBL_ESTADOS]
    WHERE [ID_Estado] = 5 -- estado == Activo
) BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B010';
-- Estado no existe
RETURN;
END -- 3) Insertar nueva cuenta por pagar
INSERT INTO [CORE].[TBL_CUENTAS_POR_PAGAR] (
        [ID_Negocio],
        [ID_Estado],
        [Concepto],
        [Descripcion],
        [Saldo],
        [FechaInicial],
        [FechaModificacion]
    )
VALUES (
        @ID_Negocio,
        5 -- Estado fijo por el momento
,
        @Concepto,
        @Descripcion,
        @Saldo,
        GETDATE() -- Timestamp actual
,
        GETDATE()
    );
-- 4) Verificar filas afectadas
IF @@ROWCOUNT = 0 BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B011';
-- No se insertó ninguna fila
RETURN;
END -- 5) Todo correcto
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B008';
-- Registro exitoso
END