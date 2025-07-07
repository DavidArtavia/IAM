
USE [IAMDB]
GO -- Stub: Crear si no existe
  IF NOT EXISTS (
    SELECT 1
    FROM sys.procedures
    WHERE name = 'SP_registrarCuenta'
) BEGIN EXEC('CREATE PROCEDURE CORE.SP_registrarCuenta AS BEGIN SET NOCOUNT ON; END ')
END
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Fecha: 01/07/2025
    -- Descripción: Registra cuenta por pagar o por cobrar en CORE.TBL_CUENTAS (estado fijo 5)
    -- =============================================
    ALTER PROCEDURE [CORE].[SP_registrarCuenta] @ID_Negocio INT,
    @Concepto VARCHAR(50),
    @Descripcion VARCHAR(255),
    @Monto DECIMAL(16, 3),
    @TipoCuenta VARCHAR(50),
    @FechaLimite DATETIME,
    @ID_OrdenServicio INT = NULL,
    @DetalleJSON NVARCHAR(MAX) = NULL AS BEGIN
SET NOCOUNT ON;
-- Tabla temporal para OUTPUT
DECLARE @Inserted TABLE (
        ID_Cuenta INT,
        ID_Negocio INT,
        ID_Estado INT,
        Concepto VARCHAR(50),
        Descripcion VARCHAR(255),
        Monto DECIMAL(16, 3),
        FechaInicial DATETIME,
        FechaModificacion DATETIME,
        FechaLimite DATETIME,
        TipoCuenta VARCHAR(50),
        ID_OrdenServicio INT,
        DetalleJSON NVARCHAR(MAX)
    );
-- Insertar la cuenta por pagar
INSERT INTO CORE.TBL_CUENTAS (
        ID_Negocio,
        ID_Estado,
        Concepto,
        Descripcion,
        Monto,
        FechaInicial,
        FechaModificacion,
        FechaLimite,
        TipoCuenta,
        ID_OrdenServicio,
        DetalleJSON
    ) OUTPUT inserted.ID_Cuenta,
    inserted.ID_Negocio,
    inserted.ID_Estado,
    inserted.Concepto,
    inserted.Descripcion,
    inserted.Monto,
    inserted.FechaInicial,
    inserted.FechaModificacion,
    inserted.FechaLimite,
    inserted.TipoCuenta,
    inserted.ID_OrdenServicio,
    inserted.DetalleJSON INTO @Inserted
VALUES (
        @ID_Negocio,
        5,
        -- Estado fijo: Activo
        @Concepto,
        @Descripcion,
        @Monto,
        GETDATE(),
        GETDATE(),
        @FechaLimite,
        @TipoCuenta,
        @ID_OrdenServicio,
        @DetalleJSON
    );
-- Validar que se haya insertado al menos una fila
IF NOT EXISTS (
    SELECT 1
    FROM @Inserted
) BEGIN
SELECT COD_ALERTA,
    Nombre,
    Mensaje,
    Tipo
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = 'B011';
-- No se insertó ninguna fila
RETURN;
END -- Resultado: cuenta creada con estado
SELECT I.*,
    E.Nombre AS EstadoNombre,
    E.Tabla AS EstadoTabla
FROM @Inserted I
    LEFT JOIN UTIL.TBL_ESTADOS E ON E.ID_Estado = I.ID_Estado;
-- Segundo result set: alerta de éxito
SELECT COD_ALERTA,
    Nombre,
    Mensaje,
    Tipo
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = 'B008';
-- Registro exitoso
END
GO