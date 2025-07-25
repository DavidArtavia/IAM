USE [IAMDB]
GO
    /****** Object:  StoredProcedure [CORE].[SP_actualizarOrdenServicio]    Script Date: 27/5/2025 12:22:05 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
    -- Autor:       David Artavia Arias
    -- Creación:    2025-05-26
    -- Descripción: Actualiza una orden de servicio en CORE.TBL_ORDENES_SERVICIO,
    --              usando parámetros opcionales y preservando fechas nulas.
    -- =============================================
    IF OBJECT_ID(N'[CORE].[SP_actualizarOrdenServicio]', N'P') IS NULL BEGIN EXEC(
        N'
        CREATE PROCEDURE [CORE].[SP_actualizarOrdenServicio]
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
ALTER PROCEDURE [CORE].[SP_actualizarOrdenServicio] 
	@ID_OrdenServicio INT,
    @ID_Estado INT = NULL,
	@ID_Cliente INT = NULL,
    @FechaEstimadaEntrega DATETIME = NULL,
    @FechaInicio DATETIME = NULL,
    @FechaFinal DATETIME = NULL,
    @FechaEntrega DATETIME = NULL,
    @ReferenciaJSON NVARCHAR(MAX) = NULL,
    @NotaOrdenServicio VARCHAR(255) = NULL AS BEGIN
UPDATE [CORE].[TBL_ORDENES_SERVICIO]
SET [ID_Estado] = ISNULL(@ID_Estado, [ID_Estado]),
    [ID_Cliente] = @ID_Cliente,
    [FechaEstimadaEntrega] = @FechaEstimadaEntrega,
    -- puede ser NULL
    [FechaInicio] = @FechaInicio,
    -- puede ser NULL
    [FechaFinal] = @FechaFinal,
    -- puede ser NULL
    [FechaEntrega] = @FechaEntrega,
    -- puede ser NULL
    [ReferenciaJSON] = ISNULL(@ReferenciaJSON, [ReferenciaJSON]),
    [NotaOrdenServicio] = ISNULL(@NotaOrdenServicio, [NotaOrdenServicio])
WHERE [ID_OrdenServicio] = @ID_OrdenServicio;

 SELECT ORDEN.ID_OrdenServicio,
        ORDEN.ID_Cliente,
        ORDEN.ID_Negocio,
        ORDEN.ID_Estado,
        ORDEN.FechaOrdenServicio,
        ORDEN.FechaEstimadaEntrega,
        ORDEN.FechaInicio,
        ORDEN.FechaFinal,
        ORDEN.FechaEntrega,
        ORDEN.ReferenciaJSON,
        -- Concatenamos el nombre del cliente al final de la nota
          'Cliente: ' 
          + CLIENTE.NombreCliente 
		  + ' | '
		  + ORDEN.NotaOrdenServicio 
         
        AS NotaOrdenConCliente
    FROM CORE.TBL_ORDENES_SERVICIO AS ORDEN
    INNER JOIN CORE.TBL_CLIENTES        AS CLIENTE
        ON CLIENTE.ID_Cliente = ORDEN.ID_Cliente
	WHERE ORDEN.ID_OrdenServicio = @ID_OrdenServicio


--Ajuste para que muestre cual fue la orden de servicio actualizada en el mensaje
SELECT 
    [COD_ALERTA],
    [Nombre],
    REPLACE([Mensaje], 'orden de servicio', 'orden de servicio #' + CAST(@ID_OrdenServicio AS VARCHAR)) AS Mensaje,
    [Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'B023';
-- Actualización exitosa
END
GO