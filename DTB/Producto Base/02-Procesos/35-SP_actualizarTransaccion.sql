USE [IAMDB]
GO -- Crear stub si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM sys.procedures
        WHERE name = 'SP_actualizarTransaccion'
    ) BEGIN EXEC(
        'CREATE PROCEDURE CORE.SP_actualizarTransaccion AS BEGIN SET NOCOUNT ON; END'
    )
END
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Creación: 25/06/2025
    -- Descripción: Actualiza una transacción
    -- =============================================
    ALTER PROCEDURE CORE.SP_actualizarTransaccion @ID_Transaccion INT,
    @Concepto VARCHAR(100),
    @Monto DECIMAL(16, 3),
    @Tipo VARCHAR(50),
    @NumReferencia VARCHAR(100) = NULL,
    @TipoNumReferencia VARCHAR(50) = NULL,
    @ID_Estado INT AS BEGIN
SET NOCOUNT ON;
UPDATE [CORE].[TBL_TRANSACCIONES]
SET Concepto = @Concepto,
    Monto = @Monto,
    Tipo = @Tipo,
    NumReferencia = @NumReferencia,
    TipoNumReferencia = @TipoNumReferencia,
    ID_Estado = @ID_Estado
WHERE ID_Transaccion = @ID_Transaccion;
-- Alerta de éxito
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B034';
END