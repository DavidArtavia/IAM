USE [IAMDB]
GO
    /****** Object:  StoredProcedure [CORE].[SP_registrarOrdenServicio]    Script Date: 27/5/2025 12:14:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor:       David Artavia Arias
    -- Creación:    2025-05-26
	-- Modificacion: 30/05/2025 (Se agrega el Output para que la IA entienda el ID creado y proceda con demás procesos y se quitan validaciones)
    -- Descripción: Registra una nueva orden de servicio,
    --              capturando FechaOrdenServicio con GETDATE() y permitiendo NULL en algunos elementos.
    -- =============================================
    IF OBJECT_ID(N'[CORE].[SP_registrarOrdenServicio]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [CORE].[SP_registrarOrdenServicio]
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
    ALTER PROCEDURE [CORE].[SP_registrarOrdenServicio] @ID_Cliente INT,
    @ID_Negocio INT,
    @ID_Estado INT,
    @FechaEstimadaEntrega DATETIME = NULL,
    @FechaInicio DATETIME = NULL,
    -- Acepta NULL
    @FechaFinal DATETIME = NULL,
    -- Acepta NULL
    @FechaEntrega DATETIME = NULL,
    @ReferenciaJSON NVARCHAR(MAX) = NULL,
    @NotaOrdenServicio VARCHAR(255) = NULL AS BEGIN

INSERT INTO [CORE].[TBL_ORDENES_SERVICIO] (
        [ID_Cliente],
        [ID_Negocio],
        [ID_Estado],
        [FechaOrdenServicio],
        [FechaEstimadaEntrega],
        [FechaInicio],
        [FechaFinal],
        [FechaEntrega],
        [ReferenciaJSON],
        [NotaOrdenServicio]
    )
OUTPUT 
    inserted.ID_OrdenServicio,
    inserted.ID_Cliente,
    inserted.ID_Negocio,
    inserted.ID_Estado,
    inserted.FechaOrdenServicio,
    inserted.FechaEstimadaEntrega,
    inserted.FechaInicio,
    inserted.FechaFinal,
    inserted.FechaEntrega,
    inserted.ReferenciaJSON,
    inserted.NotaOrdenServicio
VALUES (
        @ID_Cliente,
        @ID_Negocio,
        @ID_Estado, -- PUEDE SER 6 (Activo) por defecto
        GETDATE(),
        @FechaEstimadaEntrega,
        @FechaInicio, -- puede ser NULL
        @FechaFinal, -- puede ser NULL
        @FechaEntrega,
        @ReferenciaJSON,
        @NotaOrdenServicio
    );


SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B018';

END