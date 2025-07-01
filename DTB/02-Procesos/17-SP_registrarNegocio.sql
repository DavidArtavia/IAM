USE [IAMDB]
GO -- Stub: Crear procedimiento si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM sys.procedures
        WHERE name = 'SP_registrarNegocio'
            AND schema_id = SCHEMA_ID('CORE')
    ) BEGIN EXEC(
        'CREATE PROCEDURE CORE.SP_registrarNegocio AS BEGIN SET NOCOUNT ON; END'
    )
END
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Fecha: 30/06/2025
    -- Descripción: Registra un nuevo negocio (máximo 3 por usuario) y retorna el negocio insertado + estado + alerta
    -- =============================================
    ALTER PROCEDURE [CORE].[SP_registrarNegocio] @ID_Usuario INT,
    @NombreNegocio VARCHAR(100),
    @Descripcion NVARCHAR(255) = NULL,
    @Direccion NVARCHAR(255) = NULL,
    @TelefonoNegocio VARCHAR(15) = NULL,
    @CorreoNegocio NVARCHAR(100) = NULL,
    @ReferenciaJSON NVARCHAR(MAX) = NULL AS BEGIN
SET NOCOUNT ON;
DECLARE @numNegocios INT;
SELECT @numNegocios = COUNT(1)
FROM CORE.TBL_NEGOCIOS
WHERE ID_Usuario = @ID_Usuario;
IF @numNegocios < 3 BEGIN -- Tabla temporal para capturar la fila insertada, esto se hace para poder hacer el LEFT JOIN de UTIL.TBL_ESTADOS 
DECLARE @Inserted TABLE (
        ID_Negocio INT,
        ID_Usuario INT,
        ID_Estado INT,
        NombreNegocio VARCHAR(100),
        Descripcion NVARCHAR(255),
        Direccion NVARCHAR(255),
        TelefonoNegocio VARCHAR(15),
        CorreoNegocio NVARCHAR(100),
        FechaRegistro DATETIME,
        ReferenciaJSON NVARCHAR(MAX)
    );
-- Insertar y capturar
INSERT INTO CORE.TBL_NEGOCIOS (
        ID_Usuario,
        ID_Estado,
        NombreNegocio,
        Descripcion,
        Direccion,
        TelefonoNegocio,
        CorreoNegocio,
        FechaRegistro,
        ReferenciaJSON
    ) OUTPUT inserted.ID_Negocio,
    inserted.ID_Usuario,
    inserted.ID_Estado,
    inserted.NombreNegocio,
    inserted.Descripcion,
    inserted.Direccion,
    inserted.TelefonoNegocio,
    inserted.CorreoNegocio,
    inserted.FechaRegistro,
    inserted.ReferenciaJSON INTO @Inserted
VALUES (
        @ID_Usuario,
        4,
        -- Estado activo por defecto
        @NombreNegocio,
        @Descripcion,
        @Direccion,
        @TelefonoNegocio,
        @CorreoNegocio,
        GETDATE(),
        @ReferenciaJSON
    );
-- 1️⃣ Primer result set: datos insertados + estado
SELECT I.*,
    E.Nombre AS EstadoNombre,
    E.Tabla AS EstadoTabla
FROM @Inserted I
    LEFT JOIN UTIL.TBL_ESTADOS E ON E.ID_Estado = I.ID_Estado;
-- 2️⃣ Segundo result set: alerta
SELECT COD_ALERTA,
    Nombre,
    Mensaje,
    Tipo
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = 'B001';
-- 'Negocio registrado correctamente'
END
ELSE BEGIN -- Alerta: máximo alcanzado
SELECT COD_ALERTA,
    Nombre,
    Mensaje,
    Tipo
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = 'B002';
END
END
GO