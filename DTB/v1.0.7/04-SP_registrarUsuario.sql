USE [IAMDB]
GO
    /****** Object:  StoredProcedure [SECU].[SP_registrarUsuario]    Script Date: 17/10/2025 16:44:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Creacion: 17/10/2025
    -- Descripcion: Procedimiento para registrar un usuario se crea con estado 'Por Validar' (se utiliza en la página de registro del sistema)
    -- =============================================
    ALTER PROCEDURE [SECU].[SP_registrarUsuario] @NombreUsuario VARCHAR(100),
    @Apellido VARCHAR(100),
    @TelefonoUsuario VARCHAR(15),
    @CorreoUsuario NVARCHAR(50),
    @Pass NVARCHAR(255) AS BEGIN IF EXISTS (
        SELECT 1
        FROM [SECU].[TBL_USUARIOS]
        WHERE [CorreoUsuario] = @CorreoUsuario
    ) BEGIN -- Correo ya existe
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'A002'
END
ELSE BEGIN -- Si el correo no existe, proceder con la inserci�n
INSERT INTO [SECU].[TBL_USUARIOS] (
        [ID_Estado],
        [ID_Rol],
        [NombreUsuario],
        [Apellido],
        [TelefonoUsuario],
        [CorreoUsuario],
        [Pass]
    )
VALUES (
        35, -- Estado 'Por Validar'
        1,
        @NombreUsuario,
        @Apellido,
        @TelefonoUsuario,
        @CorreoUsuario,
        @Pass
    )
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'A001'
END
END
GO