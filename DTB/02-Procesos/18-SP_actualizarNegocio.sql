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
    IF OBJECT_ID(N'[CORE].[SP_actualizarNegocio]', N'P') IS NULL BEGIN EXEC(
        N'
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
-- Para verificar propietario
@ID_Estado INT = NULL,
@NombreNegocio VARCHAR(100),
@Descripcion NVARCHAR(255) = NULL,
@Direccion NVARCHAR(255) = NULL,
@TelefonoNegocio VARCHAR(20) = NULL,
@CorreoNegocio NVARCHAR(100) = NULL,
@ReferenciaJSON NVARCHAR(MAX) = NULL AS BEGIN
SET NOCOUNT ON;
-- Intentamos hacer el UPDATE sólo si el negocio existe
-- y pertenece al usuario que lo solicita
UPDATE [CORE].[TBL_NEGOCIOS]
SET [ID_Estado] = ISNULL(@ID_Estado, [ID_Estado]),
    [NombreNegocio] = @NombreNegocio,
    [Descripcion] = @Descripcion,
    [Direccion] = @Direccion,
    [TelefonoNegocio] = @TelefonoNegocio,
    [CorreoNegocio] = @CorreoNegocio,
    [ReferenciaJSON] = @ReferenciaJSON
WHERE [ID_Negocio] = @ID_Negocio
    AND [ID_Usuario] = @ID_Usuario;
IF @@ROWCOUNT > 0 BEGIN -- actualización exitosa
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B003';
-- B003 = negocio actualizado
END
ELSE BEGIN -- no existe o no es del usuario
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B004';
-- B004 = no encontrado o sin permiso
END
END