USE [IAMDB]
GO
    /****** Object:  StoredProcedure [SECU].[SP_actualizarUsuario]    Script Date: 27/5/2025 12:28:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Creación: 21/05/2025
    -- Descripción: SP para actualizar la información de un usuario
    --              Validando si la operación fue exitosa
    -- =============================================
    IF OBJECT_ID(N'[SECU].[SP_actualizarUsuario]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [SECU].[SP_actualizarUsuario]
        AS
        BEGIN
            SET NOCOUNT ON;
        END
    '
    );
END
GO
 ALTER PROCEDURE [SECU].[SP_actualizarUsuario] @ID_Usuario INT,
    @NombreUsuario VARCHAR(100) = NULL,
    @Apellido VARCHAR(100) = NULL,
    @TelefonoUsuario NVARCHAR(15) = NULL AS BEGIN
SET NOCOUNT ON;
-- Validar que el usuario exista
IF NOT EXISTS (
    SELECT 1
    FROM [SECU].[TBL_USUARIOS]
    WHERE ID_Usuario = @ID_Usuario
) BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B006';
-- Usuario no encontrado
RETURN;
END -- Actualización parcial sólo si se envía el dato
UPDATE [SECU].[TBL_USUARIOS]
SET [NombreUsuario] = ISNULL(@NombreUsuario, NombreUsuario),
    [Apellido] = ISNULL(@Apellido, Apellido),
    [TelefonoUsuario] = ISNULL(@TelefonoUsuario, TelefonoUsuario)
WHERE [ID_Usuario] = @ID_Usuario;
IF @@ROWCOUNT > 0 BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B005';
-- Actualización exitosa
END
ELSE BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B007';
-- Sin cambios aplicados
END
END