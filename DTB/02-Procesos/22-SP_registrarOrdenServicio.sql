USE [IAMDB]
GO -- Stub: Crear procedimiento si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM sys.procedures
        WHERE name = 'SP_registrarOrdenServicio'
    ) 
BEGIN 
    EXEC('CREATE PROCEDURE CORE.SP_registrarOrdenServicio AS BEGIN SET NOCOUNT ON; END')
END
GO

GO -- =============================================
    -- Autor: David Artavia Arias
    -- Fecha: 30/06/2025
    -- Descripción: Registra una orden de servicio y retorna datos + alerta
    -- =============================================
    ALTER PROCEDURE [CORE].[SP_registrarOrdenServicio] @ID_Cliente INT,
    @ID_Negocio INT,
    @FechaEstimadaEntrega DATETIME = NULL,
    @FechaInicio DATETIME = NULL,
    @FechaFinal DATETIME = NULL,
    @FechaEntrega DATETIME = NULL,
    @ReferenciaJSON NVARCHAR(MAX) = NULL,
    @NotaOrdenServicio VARCHAR(255) = NULL AS BEGIN
SET NOCOUNT ON;
-- 1. Tabla temporal para capturar la orden insertada
DECLARE @Inserted TABLE (
        ID_OrdenServicio INT,
        ID_Cliente INT,
        ID_Negocio INT,
        ID_Estado INT,
        FechaOrdenServicio DATETIME,
        FechaEstimadaEntrega DATETIME,
        FechaInicio DATETIME,
        FechaFinal DATETIME,
        FechaEntrega DATETIME,
        ReferenciaJSON NVARCHAR(MAX),
        NotaOrdenServicio VARCHAR(255)
    );
-- 2. Insertar orden
INSERT INTO CORE.TBL_ORDENES_SERVICIO (
        ID_Cliente,
        ID_Negocio,
        ID_Estado,
        FechaOrdenServicio,
        FechaEstimadaEntrega,
        FechaInicio,
        FechaFinal,
        FechaEntrega,
        ReferenciaJSON,
        NotaOrdenServicio
    ) OUTPUT inserted.ID_OrdenServicio,
    inserted.ID_Cliente,
    inserted.ID_Negocio,
    inserted.ID_Estado,
    inserted.FechaOrdenServicio,
    inserted.FechaEstimadaEntrega,
    inserted.FechaInicio,
    inserted.FechaFinal,
    inserted.FechaEntrega,
    inserted.ReferenciaJSON,
    inserted.NotaOrdenServicio INTO @Inserted
VALUES (
        @ID_Cliente,
        @ID_Negocio,
        6,
        -- Estado por defecto: Activo
        GETDATE(),
        @FechaEstimadaEntrega,
        @FechaInicio,
        @FechaFinal,
        @FechaEntrega,
        @ReferenciaJSON,
        @NotaOrdenServicio
    );
-- 3. Actualizar nota para incluir nombre del cliente
UPDATE I
SET NotaOrdenServicio = 'Cliente: ' + C.NombreCliente + ' | ' + I.NotaOrdenServicio
FROM @Inserted I
    INNER JOIN CORE.TBL_CLIENTES C ON C.ID_Cliente = I.ID_Cliente;
-- 4. Devolver la orden insertada con estado completo
SELECT I.*,
    E.Nombre AS EstadoNombre,
    E.Tabla AS EstadoTabla
FROM @Inserted I
    LEFT JOIN UTIL.TBL_ESTADOS E ON E.ID_Estado = I.ID_Estado;
-- 5. Devolver alerta como segundo result set
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = 'B018';
END
GO