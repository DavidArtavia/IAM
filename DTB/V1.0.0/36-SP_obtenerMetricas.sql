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

DECLARE @Hoy DATE = CAST(GETDATE() AS DATE);  

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


--#START KPI Cuentas Por Cobrar
DECLARE @KPI_Sum_CXC DECIMAL(16,3)


SET @KPI_Sum_CXC = (SELECT SUM(CUENTA.Monto) 
					FROM [CORE].[TBL_CUENTAS] CUENTA 
					INNER JOIN [CORE].[TBL_NEGOCIOS] NEGOCIO ON CUENTA.ID_Negocio = NEGOCIO.ID_Negocio
					INNER JOIN [SECU].[TBL_USUARIOS] USUARIO ON NEGOCIO.ID_Usuario = USUARIO.ID_Usuario
					WHERE CUENTA.TipoCuenta = 'Cuenta Por Cobrar' 
						AND CUENTA.FechaInicial >= @FechaInicio
						AND CUENTA.FechaInicial <= @FechaFin
						AND CUENTA.ID_Negocio = @ID_Negocio
						AND USUARIO.ID_Usuario = @ID_Usuario
					GROUP BY (CUENTA.TipoCuenta))

SELECT 'Cuentas Por' AS TituloRegular, 'Cobrar' AS TituloNegrita, 'RN' AS OrdenTitulos, 'text-info' AS TXTColor, 'bg-light-info' AS BGColor, '' AS ValorRegular, '₡' + CAST(@KPI_Sum_CXC AS VARCHAR) AS ValorNegrita, 'NR' AS OrdenValores, 'bi-file-earmark-plus' AS Icono, 'Este valor representa la sumatoria de los montos para las cuentas por cobrar creadas dentro del período seleccionado (no toma en cuenta si ya se cobraron o siguen pendientes)' AS Info
--#END KPI Cuentas Por Cobrar

--#START KPI Cuentas Por Pagar
DECLARE @KPI_Sum_CXP DECIMAL(16,3)
SET @KPI_Sum_CXP = (SELECT SUM(CUENTA.Monto) 
					FROM [CORE].[TBL_CUENTAS] CUENTA 
					INNER JOIN [CORE].[TBL_NEGOCIOS] NEGOCIO ON CUENTA.ID_Negocio = NEGOCIO.ID_Negocio
					INNER JOIN [SECU].[TBL_USUARIOS] USUARIO ON NEGOCIO.ID_Usuario = USUARIO.ID_Usuario
					WHERE CUENTA.TipoCuenta = 'Cuenta Por Pagar' 
						AND CUENTA.FechaInicial >= @FechaInicio
						AND CUENTA.FechaInicial <= @FechaFin
						AND CUENTA.ID_Negocio = @ID_Negocio
						AND USUARIO.ID_Usuario = @ID_Usuario
					GROUP BY (CUENTA.TipoCuenta))

SELECT 'Cuentas Por' AS TituloRegular, 'Pagar' AS TituloNegrita, 'RN' AS OrdenTitulos, 'text-warning' AS TXTColor, 'bg-light-warning' AS BGColor, '' AS ValorRegular, '₡' + CAST(@KPI_Sum_CXP AS VARCHAR) AS ValorNegrita, 'NR' AS OrdenValores, 'bi-file-earmark-minus' AS Icono, 'Este valor representa la sumatoria de los montos para las cuentas por pagar creadas dentro del período seleccionado (no toma en cuenta si ya se cobraron o siguen pendientes)' AS Info
--#END KPI Cuentas Por Pagar

--#START KPI Balance de Cuentas (CxC-CxP)


SELECT 'de Cuentas (CxC-CxP)' AS TituloRegular, 'Balance' AS TituloNegrita, 'NR' AS OrdenTitulos, 'text-primary' AS TXTColor, 'bg-light-primary' AS BGColor, '' AS ValorRegular, '₡' + CAST((@KPI_Sum_CXC - @KPI_Sum_CXP) AS VARCHAR) AS ValorNegrita, 'NR' AS OrdenValores, 'bi-calculator' AS Icono, 'Este valor representa la diferencia entre las cuentas por cobrar y las cuentas por pagar' AS Info
--#END KPI Balance de Cuentas (CxC-CxP)

SELECT  @Filtro           AS Filtro,
        @FechaInicio      AS Actual_Inicio,
        @FechaFin         AS Actual_Fin,
        @FechaInicioPrev  AS Prev_Inicio,
        @FechaFinPrev     AS Prev_Fin;





    
END

GO