USE [IAMDB]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Creación: 20/05/2025
    -- Descripción: Procedimiento para registrar un negocio,
    --              permitiendo un máximo de 3 negocios por usuario
    -- =============================================

    -- 1) Validar existencia de la cuenta por pagar
    IF OBJECT_ID(N '[CORE].[SP_registrarNegocio]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [CORE].[SP_registrarNegocio]
        AS
        BEGIN
            SET NOCOUNT ON;
        END
    '
    );
END
GO ALTER PROCEDURE [CORE].[SP_registrarNegocio] @ID_Usuario INT,
    --@ID_Estado          INT, Descomentar si el estado se define de Backend
    @NombreNegocio VARCHAR(100),
    @Descripcion NVARCHAR(255) = NULL,
    @Direccion NVARCHAR(255) = NULL,
    @TelefonoNegocio VARCHAR(15) = NULL,
    @CorreoNegocio NVARCHAR(100) = NULL,
    @ReferenciaJSON NVARCHAR(MAX) = NULL AS BEGIN
SET NOCOUNT ON;
DECLARE @numNegocios INT;
SELECT @numNegocios = COUNT(1)
FROM [CORE].[TBL_NEGOCIOS]
WHERE [ID_Usuario] = @ID_Usuario;
IF @numNegocios < 3 BEGIN
INSERT INTO [CORE].[TBL_NEGOCIOS] (
        [ID_Usuario],
        [ID_Estado],
        [NombreNegocio],
        [Descripcion],
        [Direccion],
        [TelefonoNegocio],
        [CorreoNegocio],
        [FechaRegistro],
        [ReferenciaJSON]
    )
VALUES (
        @ID_Usuario,
        4,
        --@ID_Estado, <- Descomentar si el estado se define de Backend por el momento inicia activo
        @NombreNegocio,
        @Descripcion,
        @Direccion,
        @TelefonoNegocio,
        @CorreoNegocio,
        GETDATE(),
        @ReferenciaJSON
    );
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B001';
-- alerta de éxito (B001)
END
ELSE BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B002';
-- alerta de límite alcanzado (B002)
END
END