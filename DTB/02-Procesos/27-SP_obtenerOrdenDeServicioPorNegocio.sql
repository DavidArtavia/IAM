USE [IAMDB]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Si no existe, creamos un stub para poder hacer ALTER sin errores
IF OBJECT_ID('CORE.SP_obtenerOrdenesServicioPorNegocio','P') IS NULL
BEGIN
    EXEC('
        CREATE PROCEDURE [CORE].[SP_obtenerOrdenesServicioPorNegocio]
            @ID_Negocio INT
        AS
        BEGIN
            SET NOCOUNT ON;
        END
    ')
END
GO

-- Ahora sí, definimos el procedimiento real
ALTER PROCEDURE [CORE].[SP_obtenerOrdenesServicioPorNegocio]
    @ID_Negocio INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1000)
        ORDEN.ID_OrdenServicio,
        ORDEN.ID_Cliente,
        ORDEN.ID_Negocio,
        ESTADO.ID_Estado,
        ESTADO.Nombre       AS EstadoNombre,
        ORDEN.FechaOrdenServicio,
        ORDEN.FechaEstimadaEntrega,
        ORDEN.FechaInicio,
        ORDEN.FechaFinal,
        ORDEN.FechaEntrega,
        ORDEN.ReferenciaJSON,
        -- Concatenamos el nombre del cliente al final de la nota
        ORDEN.NotaOrdenServicio 
          + ' | Cliente: ' 
          + CLIENTE.NombreCliente 
        AS NotaOrdenConCliente
    FROM CORE.TBL_ORDENES_SERVICIO AS ORDEN
    INNER JOIN CORE.TBL_CLIENTES        AS CLIENTE
        ON CLIENTE.ID_Cliente = ORDEN.ID_Cliente
    INNER JOIN UTIL.TBL_ESTADOS         AS ESTADO
        ON ESTADO.ID_Estado  = ORDEN.ID_Estado
    WHERE ORDEN.ID_Negocio = @ID_Negocio
    ORDER BY ORDEN.ID_OrdenServicio DESC;

    -- Alerta de éxito
    SELECT
        COD_ALERTA,
        Nombre,
        Mensaje,
        Tipo
    FROM UTIL.TBL_ALERTAS
    WHERE COD_ALERTA = 'B028';
END
GO
