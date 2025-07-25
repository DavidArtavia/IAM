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
    -- Fecha: 23/07/2025
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
-- Contar SOLO los negocios ACTIVOS
DECLARE @numNegociosActivos INT;
SELECT @numNegociosActivos = COUNT(1)
FROM CORE.TBL_NEGOCIOS
WHERE ID_Usuario = @ID_Usuario
    AND ID_Estado = 4;
-- Solo cuenta negocios activos
DECLARE @CodigoAlerta VARCHAR(10);
IF @numNegociosActivos < 3 BEGIN
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
-- Insertar nuevo negocio
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
SET @CodigoAlerta = 'B001';
-- Éxito
-- 1️⃣ ResultSet: negocio insertado con su estado
SELECT I.*,
    E.Nombre AS EstadoNombre,
    E.Tabla AS EstadoTabla
FROM @Inserted I
    LEFT JOIN UTIL.TBL_ESTADOS E ON E.ID_Estado = I.ID_Estado;
END
ELSE BEGIN
SET @CodigoAlerta = 'B002';
-- Límite alcanzado
-- 1️⃣ ResultSet: datos vacíos con la misma estructura
SELECT NULL AS ID_Negocio,
    NULL AS ID_Usuario,
    NULL AS ID_Estado,
    NULL AS NombreNegocio,
    NULL AS Descripcion,
    NULL AS Direccion,
    NULL AS TelefonoNegocio,
    NULL AS CorreoNegocio,
    NULL AS FechaRegistro,
    NULL AS ReferenciaJSON,
    NULL AS EstadoNombre,
    NULL AS EstadoTabla
WHERE 1 = 0;
-- No devuelve filas pero mantiene la estructura
END -- 2️⃣ ResultSet: alerta (siempre presente)
SELECT COD_ALERTA,
    Nombre,
    Mensaje,
    Tipo
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = @CodigoAlerta;
END
GO