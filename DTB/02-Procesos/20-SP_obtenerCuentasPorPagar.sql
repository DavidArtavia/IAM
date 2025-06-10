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
    IF OBJECT_ID(N'[CORE].[SP_obtenerCuentasPorPagar]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [CORE].[SP_obtenerCuentasPorPagar]
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
    ALTER PROCEDURE [CORE].[SP_obtenerCuentasPorPagar] @ID_Negocio INT AS BEGIN
SET NOCOUNT ON;
-- 1) Validar existencia de Negocio
IF NOT EXISTS (
    SELECT 1
    FROM [CORE].[TBL_NEGOCIOS]
    WHERE [ID_Negocio] = @ID_Negocio
) BEGIN
SELECT [COD_ALERTA],
    [Nombre],
    [Mensaje],
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B014';
-- Negocio no existe
RETURN;
END -- 2) Obtener cuentas por pagar con su estado
SELECT CP.[ID_CuentasPorPagar],
    CP.[ID_Negocio],
    CP.[ID_Estado],
    E.[Nombre] AS NombreEstado,
    CP.[Concepto],
    CP.[Descripcion],
    CP.[Saldo],
    CP.[FechaInicial],
    CP.[FechaModificacion]
FROM [CORE].[TBL_CUENTAS_POR_PAGAR] AS CP
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