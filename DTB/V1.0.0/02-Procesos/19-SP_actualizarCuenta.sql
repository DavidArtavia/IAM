USE IAMDB
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor:       David Artavia Arias
    -- Creación:    2025-05-26
    -- Descripción: Actualiza los campos de una cuenta,
    --              usando parámetros opcionales y capturando FechaModificacion con GETDATE().
    -- =============================================
    -- 1) Validar existencia del sp 
    IF OBJECT_ID(N'[CORE].[SP_actualizarCuenta]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [CORE].[SP_actualizarCuenta]
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
    ALTER PROCEDURE [CORE].[SP_actualizarCuenta] @ID_Cuenta INT,
    @Concepto VARCHAR(50) = NULL,
    @Descripcion VARCHAR(255) = NULL,
    @Monto DECIMAL(16, 3) = NULL,
    @ID_Estado INT = NULL,
    @DetalleJSON NVARCHAR(MAX) = NULL AS BEGIN
SET NOCOUNT ON;
-- 1) Validar existencia de la cuenta
IF NOT EXISTS (
    SELECT 1
    FROM [CORE].[TBL_CUENTAS]
    WHERE [ID_Cuenta] = @ID_Cuenta
) BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B016';
RETURN;
END -- 2) Validar existencia del estado si se proporcionó
IF @ID_Estado IS NOT NULL
AND NOT EXISTS (
    SELECT 1
    FROM [UTIL].[TBL_ESTADOS]
    WHERE [ID_Estado] = @ID_Estado
) BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B017';
RETURN;
END -- 3) Ejecutar UPDATE
UPDATE [CORE].[TBL_CUENTAS]
SET [Concepto] = ISNULL(@Concepto, [Concepto]),
    [Descripcion] = ISNULL(@Descripcion, [Descripcion]),
    [Monto] = ISNULL(@Monto, [Monto]),
    [ID_Estado] = ISNULL(@ID_Estado, [ID_Estado]),
    [FechaModificacion] = GETDATE(),
    [DetalleJSON] = ISNULL(@DetalleJSON, [DetalleJSON])
WHERE [ID_Cuenta] = @ID_Cuenta;
-- 4) Verificar filas afectadas
IF @@ROWCOUNT = 0 BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B017';
RETURN;
END -- 5) Éxito
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B015';
END