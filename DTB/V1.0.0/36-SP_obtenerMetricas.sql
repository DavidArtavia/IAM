USE [IAMDB]
GO
IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_obtenerMetricas')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_obtenerMetricas AS BEGIN SET NOCOUNT ON; END ')
END
GO
-- =============================================
-- Autor: Danny Cantillano Arias
-- Creación: 13/07/2025
-- Descripción: Procedimiento para calcular los KPIs y obtenerlos para mostrarlos en la pantalla Métricas
-- =============================================

ALTER PROCEDURE CORE.SP_obtenerMetricas
			@ID_Usuario INT,
			@ID_Negocio INT,
			@Filtro VARCHAR(50) --Hoy, Semana, Mes, Trimestre, Semestre, Año
AS
BEGIN

-- DECLARE @Hoy DATE = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE);  --Para pruebas
DECLARE @Hoy DATE = GETDATE()  

DECLARE @FechaInicio      DATE;			-- inicio período actual
DECLARE @FechaFin         DATE = @Hoy;  -- fin período actual
DECLARE @FechaInicioPrev  DATE;			-- inicio período anterior
DECLARE @FechaFinPrev     DATE;			-- fin período anterior


SET DATEFIRST 1;

-- PERÍODO ACTUAL

SELECT @FechaInicio =
CASE @Filtro
    WHEN 'Hoy'       THEN @FechaFin

    WHEN 'Semana'    THEN DATEADD(DAY , 1 - DATEPART(WEEKDAY, @FechaFin), @FechaFin)

    WHEN 'Mes'       THEN DATEADD(DAY , 1 - DAY(@FechaFin),               @FechaFin)

    WHEN 'Trimestre' THEN DATEADD(MONTH, -2, DATEFROMPARTS(YEAR(@FechaFin), MONTH(@FechaFin), 1))

    WHEN 'Semestre'  THEN DATEADD(MONTH, -5, DATEFROMPARTS(YEAR(@FechaFin), MONTH(@FechaFin), 1))

    WHEN 'Año'       THEN DATEADD(MONTH, -11, DATEFROMPARTS(YEAR(@FechaFin), MONTH(@FechaFin), 1))
END;

-- PERÍODO ANTERIOR 

SET @FechaFinPrev = DATEADD(DAY, -1, @FechaInicio);  -- día anterior al inicio actual

SELECT @FechaInicioPrev =
CASE @Filtro
    WHEN 'Hoy'       THEN @FechaFinPrev            
    WHEN 'Semana'    THEN DATEADD(WEEK  , -1, @FechaInicio)
    WHEN 'Mes'       THEN DATEADD(MONTH , -1, @FechaInicio)
    WHEN 'Trimestre' THEN DATEADD(MONTH , -3, @FechaInicio)
    WHEN 'Semestre'  THEN DATEADD(MONTH , -6, @FechaInicio)
    WHEN 'Año'       THEN DATEADD(YEAR  , -1, @FechaInicio) 
END;



--Variables para CxP y CxC
DECLARE @KPI_Sum_CXC DECIMAL(16,3),
 @KPI_Sum_CXP DECIMAL(16,3),
 @KPI_Cont_CXP INT,
 @KPI_Cont_CXC INT,
 @KPI_Sum_CXP_Prev DECIMAL(16,3),
 @KPI_Sum_CXC_Prev DECIMAL(16,3)

--Variables Transacciones
DECLARE
 @TotIngresos INT,
 @TotGastos INT,
 @TotMontoIngresos DECIMAL(16,3),
 @TotMontoGastos DECIMAL(16,3),
 @TotMontoIngresos_Prev DECIMAL(16,3),
 @TotMontoGastos_Prev DECIMAL(16,3)


--Período Actual CxP y CxC
SELECT	@KPI_Sum_CXC	= SUM(CASE WHEN CUENTA.TipoCuenta = 'Cuenta Por Cobrar' THEN CUENTA.[Monto] ELSE 0 END),
		@KPI_Sum_CXP	= SUM(CASE WHEN CUENTA.TipoCuenta = 'Cuenta Por Pagar' THEN CUENTA.[Monto] ELSE 0 END),
		@KPI_Cont_CXC	= SUM(CASE WHEN CUENTA.TipoCuenta = 'Cuenta Por Cobrar' THEN 1 ELSE 0 END),
		@KPI_Cont_CXP	= SUM(CASE WHEN CUENTA.TipoCuenta = 'Cuenta Por Pagar' THEN 1 ELSE 0 END)
					FROM [CORE].[TBL_CUENTAS] CUENTA 
					INNER JOIN [CORE].[TBL_NEGOCIOS] NEGOCIO ON CUENTA.ID_Negocio = NEGOCIO.ID_Negocio
					INNER JOIN [SECU].[TBL_USUARIOS] USUARIO ON NEGOCIO.ID_Usuario = USUARIO.ID_Usuario
					WHERE CUENTA.FechaInicial >= @FechaInicio
						AND CUENTA.FechaInicial <= @FechaFin
						AND CUENTA.ID_Negocio = @ID_Negocio
						AND USUARIO.ID_Usuario = @ID_Usuario

--Período Pasado CxP y CxC
SELECT	@KPI_Sum_CXC_Prev	= SUM(CASE WHEN CUENTA.TipoCuenta = 'Cuenta Por Cobrar' THEN CUENTA.[Monto] ELSE 0 END),
		@KPI_Sum_CXP_Prev	= SUM(CASE WHEN CUENTA.TipoCuenta = 'Cuenta Por Pagar' THEN CUENTA.[Monto] ELSE 0 END)
					FROM [CORE].[TBL_CUENTAS] CUENTA 
					INNER JOIN [CORE].[TBL_NEGOCIOS] NEGOCIO ON CUENTA.ID_Negocio = NEGOCIO.ID_Negocio
					INNER JOIN [SECU].[TBL_USUARIOS] USUARIO ON NEGOCIO.ID_Usuario = USUARIO.ID_Usuario
					WHERE CUENTA.FechaInicial >= @FechaInicioPrev
						AND CUENTA.FechaInicial <= @FechaFinPrev
						AND CUENTA.ID_Negocio = @ID_Negocio
						AND USUARIO.ID_Usuario = @ID_Usuario

--Período Actual Transacciones

SELECT
    @TotIngresos      = SUM(CASE WHEN T.TIPO = 'Ingreso' THEN 1 ELSE 0 END),
    @TotGastos        = SUM(CASE WHEN T.TIPO = 'Gasto'   THEN 1 ELSE 0 END),
	@TotMontoIngresos = SUM(CASE WHEN T.TIPO = 'Ingreso'   THEN T.Monto ELSE 0 END),
	@TotMontoGastos = SUM(CASE WHEN T.TIPO = 'Gasto'   THEN T.Monto ELSE 0 END)
FROM  CORE.TBL_TRANSACCIONES AS T
JOIN  CORE.TBL_NEGOCIOS      AS N ON N.ID_Negocio = T.ID_Negocio
WHERE T.FechaTransaccion BETWEEN @FechaInicio AND @FechaFin
  AND T.ID_Negocio = @ID_Negocio
  AND N.ID_Usuario = @ID_Usuario;

--Período Pasado Transacciones

SELECT
	@TotMontoIngresos_Prev = SUM(CASE WHEN T.TIPO = 'Ingreso'   THEN T.Monto ELSE 0 END),
	@TotMontoGastos_Prev = SUM(CASE WHEN T.TIPO = 'Gasto'   THEN T.Monto ELSE 0 END)
FROM  CORE.TBL_TRANSACCIONES AS T
JOIN  CORE.TBL_NEGOCIOS      AS N ON N.ID_Negocio = T.ID_Negocio
WHERE T.FechaTransaccion BETWEEN @FechaInicioPrev AND @FechaFinPrev
  AND T.ID_Negocio = @ID_Negocio
  AND N.ID_Usuario = @ID_Usuario;



  -- Tabla temporal 
IF OBJECT_ID('tempdb..#KPIs') IS NOT NULL DROP TABLE #KPIs;

CREATE TABLE #KPIs (
    KPIOrder       tinyint      IDENTITY(1,1) PRIMARY KEY, -- orden en salida
    TituloRegular  varchar(120),
    TituloNegrita  varchar(120),
    OrdenTitulos   varchar(10),
    TXTColor       varchar(50),
    BGColor        varchar(50),
    ValorRegular   varchar(200),
    ValorNegrita   varchar(200),
    OrdenValores   varchar(10),
    Icono          varchar(50),
    Info           varchar(400)
);

--###################### KPIs ##########################


--#START KPI Cuentas Por Cobrar
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT 'Cuentas Por' AS TituloRegular, 'Cobrar' AS TituloNegrita, 'RN' AS OrdenTitulos, 'text-info' AS TXTColor, 'bg-light-info' AS BGColor, '' AS ValorRegular, '₡' + FORMAT(@KPI_Sum_CXC, 'N2', 'fr-FR') AS ValorNegrita, 'NR' AS OrdenValores, 'bi-file-earmark-plus' AS Icono, 'Este valor representa la sumatoria de los montos para las cuentas por cobrar creadas dentro del período seleccionado (no toma en cuenta si ya se cobraron o siguen pendientes)' AS Info
--#END KPI Cuentas Por Cobrar

--#START KPI Cuentas Por Pagar
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT 'Cuentas Por' AS TituloRegular, 'Pagar' AS TituloNegrita, 'RN' AS OrdenTitulos, 'text-warning' AS TXTColor, 'bg-light-warning' AS BGColor, '' AS ValorRegular, '₡' + FORMAT(@KPI_Sum_CXP, 'N2', 'fr-FR') AS ValorNegrita, 'NR' AS OrdenValores, 'bi-file-earmark-minus' AS Icono, 'Este valor representa la sumatoria de los montos para las cuentas por pagar creadas dentro del período seleccionado (no toma en cuenta si ya se cobraron o siguen pendientes)' AS Info
--#END KPI Cuentas Por Pagar

--#START KPI Balance de Cuentas (CxC-CxP)
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT 'de Cuentas (CxC-CxP)' AS TituloRegular, 'Balance' AS TituloNegrita, 'NR' AS OrdenTitulos, 'text-primary' AS TXTColor, 'bg-light-primary' AS BGColor, '' AS ValorRegular, '₡' + FORMAT((@KPI_Sum_CXC - @KPI_Sum_CXP), 'N2', 'fr-FR') AS ValorNegrita, 'NR' AS OrdenValores, 'bi-calculator' AS Icono, 'Este valor representa la diferencia entre las cuentas por cobrar y las cuentas por pagar' AS Info
--#END KPI Balance de Cuentas (CxC-CxP)

--#START KPI Crecimiento de Cuentas (CxC vs CxP)
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT 'de Cuentas (CxC vs CxP)' AS TituloRegular, 'Crecimiento' AS TituloNegrita, 'NR' AS OrdenTitulos, 'text-success' AS TXTColor, 'bg-light-success' AS BGColor, 'Objetivo: 2% Mensual' AS ValorRegular,
  ValorNegrita = CASE WHEN (@KPI_Sum_CXC_Prev - @KPI_Sum_CXP_Prev) = 0 THEN '---'
  ELSE CAST(FORMAT(((@KPI_Sum_CXC - @KPI_Sum_CXP) - (@KPI_Sum_CXC_Prev - @KPI_Sum_CXP_Prev)) * 100 / (@KPI_Sum_CXC_Prev - @KPI_Sum_CXP_Prev), 'N2') AS VARCHAR) + '%'
  END, 
  'NR' AS OrdenValores, 'bi-clipboard-data' AS Icono, 'Este es el porsentaje de crecimiento entre el balance de cuentas del período actual el balance de cuentas de un período igual previo' AS Info
--#END KPI Balance de Cuentas (CxC-CxP)

--#START KPI Ordenes de Servicio
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT '' AS TituloRegular, 'Ordenes de Servicio' AS TituloNegrita, 'NR' AS OrdenTitulos, 'text-gray-800' AS TXTColor, 'bg-secondary' AS BGColor, '(' + CAST(SUM(CASE WHEN ORDEN.ID_Estado = 9   THEN 1 ELSE 0 END) AS VARCHAR) + ' Finalizadas)' AS ValorRegular, CAST(COUNT(ORDEN.[ID_OrdenServicio]) AS VARCHAR) AS ValorNegrita, 'NR' AS OrdenValores, 'bi-clipboard-check' AS Icono, 'Este valor representa la cantidad de ordenes de servicio creadas durante el período seleccionado y la cantdad de ordenes de esas que fueron completadas dentro del mismo período' AS Info
FROM [CORE].[TBL_ORDENES_SERVICIO] ORDEN  
INNER JOIN [CORE].[TBL_NEGOCIOS] NEGOCIO ON ORDEN.ID_Negocio = NEGOCIO.ID_Negocio
WHERE
	 ORDEN.[FechaOrdenServicio] >= @FechaInicio
	 AND ORDEN.[FechaOrdenServicio] >= @FechaFin
	 AND NEGOCIO.ID_Negocio = @ID_Negocio
	 AND NEGOCIO.ID_Usuario = @ID_Usuario
--#END KPI Ordenes de Servicio

--#START KPI Clientes Nuevos
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT 'Nuevos' AS TituloRegular, 'Clientes' AS TituloNegrita, 'NR' AS OrdenTitulos, 'text-gray-800' AS TXTColor, 'bg-secondary' AS BGColor, '' AS ValorRegular, CAST(COUNT(CLIENTES.ID_Cliente) AS VARCHAR) AS ValorNegrita, 'NR' AS OrdenValores, 'bi-people' AS Icono, 'Cantidad de clientes nuevos creados dentro del período' AS Info
FROM [CORE].[TBL_CLIENTES] CLIENTES
WHERE CLIENTES.[FechaCreacion] >= @FechaInicio
	 AND CLIENTES.[FechaCreacion] >= @FechaFin
	 AND CLIENTES.ID_Usuario = @ID_Usuario
--#END KPI Clientes Nuevos


--#START KPI Transacciones
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT
    ''                    AS TituloRegular,
    'Transacciones'       AS TituloNegrita,
    'NR'                  AS OrdenTitulos,
    'text-gray-800'       AS TXTColor,
    'bg-secondary'        AS BGColor,
    '(' + CAST(@TotIngresos AS varchar(20)) + ' Ingreso y '
        + CAST(@TotGastos   AS varchar(20)) + ' Gasto)'        AS ValorRegular,
    CAST(@TotIngresos + @TotGastos AS varchar(20))                     AS ValorNegrita,
    'NR'                  AS OrdenValores,
    'bi-arrow-left-right' AS Icono,
    'Cantidad de transacciones dentro del período (se especifica cuáles son gastos y cuáles son ingresos)'
                         AS Info;
--#END KPI Transacciones


--#START KPI Cuentas
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT
    ''                    AS TituloRegular,
    'Cuentas'       AS TituloNegrita,
    'NR'                  AS OrdenTitulos,
    'text-gray-800'       AS TXTColor,
    'bg-secondary'        AS BGColor,
    '(' + CAST(@KPI_Cont_CXP AS varchar(20)) + ' CxP) ('
        + CAST(@KPI_Cont_CXC   AS varchar(20)) + ' CxC)'        AS ValorRegular,
    CAST(@KPI_Cont_CXP + @KPI_Cont_CXC AS varchar(20))                     AS ValorNegrita,
    'NR'                  AS OrdenValores,
    'bi-cash-stack' AS Icono,
    'Cantidad de cuentas dentro del período (se especifica cuáles son CxC y cuáles son CxP)'
                         AS Info;

--#END KPI Cuentas



--#START KPI Ingreso
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT 'Transacciones de ' AS TituloRegular, 'Ingreso' AS TituloNegrita, 'RN' AS OrdenTitulos, 'text-light-info' AS TXTColor, 'bg-info' AS BGColor, '' AS ValorRegular, '₡' + FORMAT(@TotMontoIngresos, 'N2', 'fr-FR') AS ValorNegrita, 'NR' AS OrdenValores, 'bi-graph-up' AS Icono, 'Este valor representa la sumatoria de los montos transacciones que representan un ingreso para el negocio' AS Info
--#END KPI Ingreso

--#START KPI Gasto
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT 'Transacciones de ' AS TituloRegular, 'Gasto' AS TituloNegrita, 'RN' AS OrdenTitulos, 'text-light-warning' AS TXTColor, 'bg-warning' AS BGColor, '' AS ValorRegular, '₡' + FORMAT(@TotMontoGastos, 'N2', 'fr-FR') AS ValorNegrita, 'NR' AS OrdenValores, 'bi-graph-down' AS Icono, 'Este valor representa la sumatoria de los montos transacciones que representan un gasto para el negocio' AS Info
--#END KPI Gasto

--#START KPI Balance Transacciones
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT 'de Transacciones (Ingresos - Gastos)' AS TituloRegular, 'Balance ' AS TituloNegrita, 'NR' AS OrdenTitulos, 'text-light-primary' AS TXTColor, 'bg-primary' AS BGColor, '' AS ValorRegular, '₡' + FORMAT(@TotMontoIngresos - @TotMontoGastos, 'N2', 'fr-FR') AS ValorNegrita, 'NR' AS OrdenValores, 'bi-calculator' AS Icono, 'Este valor representa la diferencia entre los gastos y los ingresos del negocio' AS Info
--#END KPI Balance Transacciones


--#START KPI Crecimiento de transacciones
INSERT INTO #KPIs (TituloRegular, TituloNegrita, OrdenTitulos, TXTColor, BGColor, ValorRegular, ValorNegrita, OrdenValores, Icono, Info)
SELECT ' de Transacciones (Ingresos vs Gastos)' AS TituloRegular, 'Crecimiento ' AS TituloNegrita, 'NR' AS OrdenTitulos, 'text-light-success' AS TXTColor, 'bg-success' AS BGColor, '' AS ValorRegular, ValorNegrita = CASE WHEN (@TotMontoIngresos_Prev) = 0 THEN '---'
  ELSE CAST(FORMAT((@TotMontoIngresos - @TotMontoIngresos_Prev) * 100 / @TotMontoIngresos_Prev, 'N2') AS VARCHAR) + '%' END, 'NR' AS OrdenValores, 'bi-clipboard-data' AS Icono, 'Este es el porsentaje de crecimiento entre el balance de transacciones del período actual el balance de transacciones de un período igual previo' AS Info
--#END KPI Crecimiento de transacciones


--Select final, que parida

SELECT TituloNegrita, TituloRegular, OrdenTitulos, TXTColor, BGColor, ValorRegular, ISNULL(NULLIF(ValorNegrita, '0'), '---') AS ValorNegrita, OrdenValores, Icono, Info
FROM  #KPIs
ORDER BY KPIOrder; 

SELECT * FROM [UTIL].[TBL_ALERTAS] WHERE COD_ALERTA = 'A030'
END

GO