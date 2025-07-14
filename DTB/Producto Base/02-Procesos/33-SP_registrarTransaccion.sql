USE [IAMDB]
GO -- Stub: Crear si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM sys.procedures
        WHERE name = 'SP_registrarTransaccion'
            AND SCHEMA_ID('CORE') = schema_id
    ) BEGIN EXEC(
        'CREATE PROCEDURE CORE.SP_registrarTransaccion AS BEGIN SET NOCOUNT ON; END'
    )
END
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Fecha: 30/06/2025
    -- Descripción: Registra una nueva transacción con estado completo
    -- =============================================
    ALTER PROCEDURE CORE.SP_registrarTransaccion @ID_Negocio INT,
    @Concepto VARCHAR(100),
    @Monto DECIMAL(16, 3),
    @Tipo VARCHAR(50),
    @NumReferencia VARCHAR(100) = NULL,
    @TipoNumReferencia VARCHAR(50) = NULL AS BEGIN
SET NOCOUNT ON;
DECLARE @Inserted TABLE (
        ID_Transaccion INT,
        ID_Negocio INT,
        ID_Estado INT,
        Concepto VARCHAR(100),
        Monto DECIMAL(16, 3),
        Tipo VARCHAR(50),
        NumReferencia VARCHAR(100),
        TipoNumReferencia VARCHAR(50),
        FechaTransaccion DATETIME
    );
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
    inserted.FechaTransaccion INTO @Inserted (
        ID_Transaccion,
        ID_Negocio,
        ID_Estado,
        Concepto,
        Monto,
        Tipo,
        NumReferencia,
        TipoNumReferencia,
        FechaTransaccion
    )
VALUES (
        @ID_Negocio,
        20,
        -- Activo
        @Concepto,
        @Monto,
        @Tipo,
        @NumReferencia,
        @TipoNumReferencia,
        GETDATE()
    );
-- Result set 1: transacción + estado completo
SELECT I.ID_Transaccion,
    I.ID_Negocio,
    I.ID_Estado,
    I.Concepto,
    I.Monto,
    I.Tipo,
    I.NumReferencia,
    I.TipoNumReferencia,
    I.FechaTransaccion,
    E.Nombre AS EstadoNombre,
    E.Tabla AS EstadoTabla
FROM @Inserted I
    LEFT JOIN UTIL.TBL_ESTADOS E ON E.ID_Estado = I.ID_Estado;
-- Result set 2: alerta
SELECT COD_ALERTA,
    Nombre,
    Mensaje,
    Tipo
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = 'B032';
END
GO