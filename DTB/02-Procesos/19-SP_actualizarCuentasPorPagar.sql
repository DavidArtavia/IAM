USE [IAMDB]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor:       David Artavia Arias
    -- Creación:    2025-05-26
    -- Descripción: Actualiza los campos de una cuenta por pagar,
    --              usando parámetros opcionales y capturando FechaModificacion con GETDATE().
    -- =============================================

    -- 1) Validar existencia de la cuenta por pagar
    IF OBJECT_ID(N'[CORE].[SP_actualizarCuentasPorPagar]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [CORE].[SP_actualizarCuentasPorPagar]
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
    ALTER PROCEDURE [CORE].[SP_actualizarCuentasPorPagar] @ID_CuentasPorPagar INT,
    @Concepto VARCHAR(50) = NULL,
    @Descripcion VARCHAR(255) = NULL,
    @Saldo DECIMAL(16, 3) = NULL,
    @ID_Estado INT = NULL AS BEGIN
SET NOCOUNT ON;
IF NOT EXISTS (
    SELECT 1
    FROM [CORE].[TBL_CUENTAS_POR_PAGAR]
    WHERE [ID_CuentasPorPagar] = @ID_CuentasPorPagar
) BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B016';
-- No existe la cuenta
RETURN;
END -- 2) (Opcional) Validar existencia de Estado si se proporcionó,
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
-- Sin cambios o estado inválido
RETURN;
END -- 3) Ejecutar UPDATE con parámetros opcionales y nuevo timestamp
UPDATE [CORE].[TBL_CUENTAS_POR_PAGAR]
SET [Concepto] = ISNULL(@Concepto, [Concepto]),
    [Descripcion] = ISNULL(@Descripcion, [Descripcion]),
    [Saldo] = ISNULL(@Saldo, [Saldo]),
    [ID_Estado] = ISNULL(@ID_Estado, [ID_Estado]),
    [FechaModificacion] = GETDATE()
WHERE [ID_CuentasPorPagar] = @ID_CuentasPorPagar;
-- 4) Verificar filas afectadas
IF @@ROWCOUNT = 0 BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B017';
-- No hubo cambios
RETURN;
END -- 5) Éxito
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B015';
-- Actualización exitosa
END