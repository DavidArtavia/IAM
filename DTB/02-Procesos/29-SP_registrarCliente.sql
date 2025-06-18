USE [IAMDB]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Autor: David Artavia Arias
-- Creación: 16/06/2025
-- Descripción: Registra un nuevo cliente en el sistema
-- =============================================

-- Crear stub si no existe
IF OBJECT_ID('[CORE].[SP_registrarCliente]', 'P') IS NULL
    EXEC('CREATE PROCEDURE [CORE].[SP_registrarCliente] AS BEGIN SET NOCOUNT ON; END')
GO

-- Procedimiento real
ALTER PROCEDURE [CORE].[SP_registrarCliente]
    @ID_Usuario       INT,
    @NombreCliente    VARCHAR(100),
    @ApellidoCliente  VARCHAR(100),
    @TelefonoCliente  VARCHAR(15),
    @CorreoCliente    NVARCHAR(50),
    @ID_Estado        INT = NULL -- ← Acepta NULL para poder validar internamente
AS
BEGIN
    SET NOCOUNT ON;

    -- Si viene NULL, asignar estado por defecto: 16 = Activo
    IF @ID_Estado IS NULL
        SET @ID_Estado = 3;

    -- Inserción principal
    INSERT INTO [CORE].[TBL_CLIENTES] (
        ID_Usuario,
        NombreCliente,
        ApellidoCliente,
        TelefonoCliente,
        CorreoCliente,
        ID_Estado
    )
    VALUES (
        @ID_Usuario,
        @NombreCliente,
        @ApellidoCliente,
        @TelefonoCliente,
        @CorreoCliente,
        @ID_Estado
    );

    -- Alerta de éxito (registrar si no existe)
    SELECT [COD_ALERTA],
           [Nombre],
           [Mensaje],
           [Tipo]
    FROM [UTIL].[TBL_ALERTAS]
    WHERE [COD_ALERTA] = 'B031';
END
