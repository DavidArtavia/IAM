USE [IAMDB]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_cargarMonitorOrdenServicio')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_cargarMonitorOrdenServicio AS BEGIN SET NOCOUNT ON; END ')
END
GO
GO

-- =============================================
-- Autor: David Artavia Arias
-- Fecha: 19/06/2025
-- Descripción: Consulta los datos para cargar el monitor
-- =============================================
ALTER PROCEDURE [CORE].[SP_cargarMonitorOrdenServicio]
    @ID_Negocio INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
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
          'Cliente: ' 
          + CLIENTE.NombreCliente 
		  + ' | '
		  + ORDEN.NotaOrdenServicio 
         
        AS NotaOrdenConCliente
    FROM CORE.TBL_ORDENES_SERVICIO AS ORDEN
    INNER JOIN CORE.TBL_CLIENTES        AS CLIENTE
        ON CLIENTE.ID_Cliente = ORDEN.ID_Cliente
    INNER JOIN UTIL.TBL_ESTADOS         AS ESTADO
        ON ESTADO.ID_Estado  = ORDEN.ID_Estado
    WHERE ORDEN.ID_Negocio = @ID_Negocio
    ORDER BY ORDEN.ID_OrdenServicio DESC;


	SELECT [ID_ItemOrdenServicio]
		  ,ORDEN.[ID_OrdenServicio]
		  ,ESTADO.[ID_Estado]
		  ,ESTADO.Nombre EstadoNombre
		  ,[NombreItemOrdenServicio]
		  ,[Descripcion]
		  ,[Monto]
		  ,[Avance]
	  FROM [CORE].[TBL_ITEMS_ORDEN_SERVICIO] ITEM
	  INNER JOIN [CORE].[TBL_ORDENES_SERVICIO] ORDEN ON ITEM.ID_OrdenServicio = ORDEN.ID_OrdenServicio
	  INNER JOIN [UTIL].[TBL_ESTADOS] ESTADO ON ITEM.ID_Estado = ESTADO.ID_Estado
	  WHERE ORDEN.ID_Negocio = @ID_Negocio AND ITEM.ID_Estado = 18 --ESTADO ACTIVA PRO DEBEN DE HABER MÁS ESTADOS, DEPSUES SE AJUSTA


    -- Alerta de éxito
    SELECT
        COD_ALERTA,
        Nombre,
        Mensaje,
        Tipo
    FROM UTIL.TBL_ALERTAS
    WHERE COD_ALERTA = 'A029';
END

