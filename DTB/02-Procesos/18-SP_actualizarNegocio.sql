USE [IAMDB]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Creación: 20/05/2025
    -- Descripción: Procedimiento para actualizar un negocio
    -- =============================================
    -- 1) Validar existencia del SP
    IF OBJECT_ID(N '[CORE].[SP_actualizarNegocio]', N'P') IS NULL BEGIN EXEC(
        N '
        CREATE PROCEDURE [CORE].[SP_actualizarNegocio]
        AS
        BEGIN
          SET NOCOUNT ON;
        END
    '
    );
END
GO -- 2) Alterar contenido
    ALTER PROCEDURE [CORE].[SP_actualizarNegocio] @ID_Negocio INT,
    @ID_Usuario INT,
    @ID_Estado INT,
    @NombreNegocio VARCHAR(100),
    @Descripcion NVARCHAR(255) = NULL,
    @Direccion NVARCHAR(255) = NULL,
    @TelefonoNegocio VARCHAR(20) = NULL,
    @CorreoNegocio NVARCHAR(100) = NULL,
    @ReferenciaJSON NVARCHAR(MAX) = NULL AS BEGIN AS BEGIN
SET NOCOUNT ON;
DECLARE @EstadoAnterior INT;
-- Obtenemos el estado actual del negocio (si existe y pertenece al usuario)
SELECT @EstadoAnterior = ID_Estado
FROM [CORE].[TBL_NEGOCIOS]
WHERE ID_Negocio = @ID_Negocio
    AND ID_Usuario = @ID_Usuario;
-- Si no se encuentra el negocio, salimos con alerta de error
IF @EstadoAnterior IS NULL BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B004';
-- No encontrado o sin permiso
RETURN;
END -- Hacemos el update
UPDATE [CORE].[TBL_NEGOCIOS]
SET [NombreNegocio] = @NombreNegocio,
    [ID_Estado] = @ID_Estado,
    [Descripcion] = @Descripcion,
    [Direccion] = @Direccion,
    [TelefonoNegocio] = @TelefonoNegocio,
    [CorreoNegocio] = @CorreoNegocio,
    [ReferenciaJSON] = @ReferenciaJSON
WHERE ID_Negocio = @ID_Negocio
    AND ID_Usuario = @ID_Usuario;
-- Retornamos mensaje específico si cambió a eliminado
IF @EstadoAnterior <> @ID_Estado
AND @ID_Estado = 1009 BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B026';
-- B026 = Negocio eliminado correctamente
RETURN;
END -- Si solo fue una actualización normal
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B003';
-- Negocio actualizado
END