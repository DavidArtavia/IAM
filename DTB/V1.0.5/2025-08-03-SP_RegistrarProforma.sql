USE [IAMDB]
GO 
IF NOT EXISTS (
        SELECT 1
        FROM sys.procedures
        WHERE name = 'SP_registrarProforma'
    ) BEGIN EXEC(
        'CREATE PROCEDURE CORE.SP_registrarProforma AS BEGIN SET NOCOUNT ON; END'
    )
END
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Fecha: 13/08/2025
    -- Descripción: Crea proforma (26=Borrador) y devuelve el registro insertado
    -- =============================================
    ALTER PROCEDURE CORE.SP_registrarProforma 
    @ID_Negocio INT,
    @ID_Cliente INT,
    @ID_Estado INT,
    -- 26=Borrador, 27=Aprobada, 28=Anulada
    @ObservacionProforma NVARCHAR(255) = NULL,
    @FechaVencimiento DATETIME = NULL AS BEGIN
SET NOCOUNT ON;
DECLARE @Inserted TABLE(
        ID_Proforma INT,
        ID_Negocio INT,
        ID_Cliente INT,
        ID_Estado INT,
        FechaProforma DATETIME,
        FechaVencimiento DATETIME,
        ObservacionProforma NVARCHAR(255),
        FechaModificacion DATETIME
    );
INSERT INTO CORE.TBL_PROFORMAS (
        ID_Negocio,
        ID_Cliente,
        ID_Estado,
        FechaProforma,
        FechaVencimiento,
        ObservacionProforma,
        FechaModificacion
    ) OUTPUT inserted.ID_Proforma,
    inserted.ID_Negocio,
    inserted.ID_Cliente,
    inserted.ID_Estado,
    inserted.FechaProforma,
    inserted.FechaVencimiento,
    inserted.ObservacionProforma,
    inserted.FechaModificacion INTO @Inserted
VALUES (
        @ID_Negocio,
        @ID_Cliente,
        26,
        -- Borrador
        GETDATE(),
        @FechaVencimiento,
        @ObservacionProforma,
        GETDATE() -- FechaModificacion
    );
-- 1) Proforma insertada
SELECT I.*,
    E.Nombre AS EstadoNombre
FROM @Inserted I
    LEFT JOIN UTIL.TBL_ESTADOS E ON E.ID_Estado = I.ID_Estado;
-- 2) Alerta
SELECT COD_ALERTA,
    Nombre,
    Mensaje,
    Tipo
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = 'B039';
END
GO

