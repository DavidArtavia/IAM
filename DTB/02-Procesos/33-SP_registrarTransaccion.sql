USE [IAMDB]
GO -- Stub: Crear procedimiento si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM sys.procedures
        WHERE name = 'CORE.SP_registrarTransaccion'
    ) BEGIN EXEC(
        'CREATE PROCEDURE CORE.SP_registrarTransaccion AS BEGIN SET NOCOUNT ON; END'
    )
END
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Fecha: 25/06/2025
    -- Descripción: Registra una nueva transacción en el sistema
    -- =============================================
    ALTER PROCEDURE CORE.SP_registrarTransaccion @ID_Negocio INT,
    @Concepto VARCHAR(100),
    @Monto DECIMAL(16, 3),
    @Tipo VARCHAR(50),
    @NumReferencia VARCHAR(100) = NULL,
    @TipoNumReferencia VARCHAR(50) = NULL AS BEGIN
SET NOCOUNT ON;
-- Insertar transacción
INSERT INTO CORE.TBL_TRANSACCIONES (
        ID_Negocio,
        ID_Estado,
        Concepto,
        Monto,
        Tipo,
        NumReferencia,
        TipoNumReferencia,
        FechaTransaccion
    ) OUTPUT inserted.ID_Transaccion,
    inserted.ID_Negocio,
    inserted.ID_Estado,
    inserted.Concepto,
    inserted.Monto,
    inserted.Tipo,
    inserted.NumReferencia,
    inserted.TipoNumReferencia,
    inserted.FechaTransaccion
VALUES (
        @ID_Negocio,
        20, -- Estado por defecto: Activo
        @Concepto,
        @Monto,
        @Tipo,
        @NumReferencia,
        @TipoNumReferencia,
        GETDATE()
    );
-- Alerta de éxito
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B032';
-- 'Transacción registrada correctamente'
END