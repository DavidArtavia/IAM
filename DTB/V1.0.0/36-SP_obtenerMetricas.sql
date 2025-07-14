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
			@ID_Usuario INT = null,
			@ID_Negocio INT = null,
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
DECLARE @KPI_CXP DECIMAL(16,3)

SET @KPI_CXP = SELECT SUM(Cuentas.Saldo) FROM 

SELECT '' AS TituloRegular, '' AS TituloNegrita, '' AS OrdenTitulos, '' AS TXTColor, '' AS BGColor, '' AS ValorRegular, '' AS ValorNegrita, '' AS OrdenValores, '' AS Icono, '' AS Info

--#END KPI Cuentas Por Cobrar


SELECT  @Filtro           AS Filtro,
        @FechaInicio      AS Actual_Inicio,
        @FechaFin         AS Actual_Fin,
        @FechaInicioPrev  AS Prev_Inicio,
        @FechaFinPrev     AS Prev_Fin;





    
END

GO