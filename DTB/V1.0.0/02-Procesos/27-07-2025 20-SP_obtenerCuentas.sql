USE [IAMDB]
GO
    /****** Object:  StoredProcedure [CORE].[SP_obtenerCuentasPorPagar]    Script Date: 27/5/2025 12:03:00 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor:       David Artavia Arias
    -- Creación:    2025-05-26
    -- Descripción: Obtiene las cuentas por pagar de un negocio,
    --              incluyendo el estado y seleccionando alertas.
    -- =============================================
    IF OBJECT_ID(N'[CORE].[SP_obtenerCuentas]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [CORE].[SP_obtenerCuentas]
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
    ALTER PROCEDURE [CORE].[SP_obtenerCuentas] @ID_Negocio INT AS BEGIN
SET NOCOUNT ON;
SELECT CP.[ID_Cuenta],
    CP.[ID_Negocio],
    CP.[ID_Estado],
    E.[Nombre] AS NombreEstado,
    CP.[Concepto],
    CP.[Descripcion],
    CP.[Monto],
    CP.[FechaInicial],
    CP.[FechaModificacion],
    CP.[FechaLimite],
    CP.[TipoCuenta],
	CP.[ID_OrdenServicio],
	CP.[DetalleJSON]
FROM [CORE].[TBL_CUENTAS] AS CP
    INNER JOIN [UTIL].[TBL_ESTADOS] AS E ON CP.[ID_Estado] = E.[ID_Estado]
WHERE CP.[ID_Negocio] = @ID_Negocio;
-- 3) Verificar si se obtuvieron filas
IF @@ROWCOUNT = 0 BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B013';
-- No se encontraron registros
RETURN;
END -- 4) Todo correcto
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B012';
-- Consulta exitosa
END