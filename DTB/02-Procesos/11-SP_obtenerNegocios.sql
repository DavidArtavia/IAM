USE [IAMDB]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- =============================================
	-- Autor: David Artavia Arias
	-- Creación: 15/06/2025
	-- Descripción: Procedimiento para obtener los negocios específicos por estados
	-- =============================================
	-- Crear stub si no existe
	IF OBJECT_ID('[CORE].[SP_obtenerNegocios]', 'P') IS NULL EXEC(
		'CREATE PROCEDURE [CORE].[SP_obtenerNegocios] AS BEGIN SET NOCOUNT ON; END'
	)
GO ALTER PROCEDURE [CORE].[SP_obtenerNegocios] @ID_Usuario INT,
	@FiltroEstado VARCHAR(20) = 'ACTIVOS' AS BEGIN
SET NOCOUNT ON;
-- Obtener dinámicamente los ID_Estado desde la tabla de estados (los IDs pueden cambiar)
DECLARE @ESTADO_ACTIVO INT;
DECLARE @ESTADO_ELIMINADO INT;
-- Replicar lógica si se desea manejar otros estados adicionales
SELECT @ESTADO_ACTIVO = ID_Estado
FROM [UTIL].[TBL_ESTADOS]
WHERE Nombre = 'Activo'
	AND Tabla = 'TBL_NEGOCIOS';
SELECT @ESTADO_ELIMINADO = ID_Estado
FROM [UTIL].[TBL_ESTADOS]
WHERE Nombre = 'Eliminado'
	AND Tabla = 'TBL_NEGOCIOS';
-- Consulta principal con lógica de filtro
SELECT NEGOCIO.[ID_Negocio],
	NEGOCIO.[ID_Usuario],
	ESTADO.[ID_Estado],
	ESTADO.[Nombre] AS EstadoNombre,
	[NombreNegocio],
	[Descripcion],
	[Direccion],
	[TelefonoNegocio],
	[CorreoNegocio],
	[FechaRegistro],
	[ReferenciaJSON]
FROM [CORE].[TBL_NEGOCIOS] NEGOCIO
	INNER JOIN [UTIL].[TBL_ESTADOS] ESTADO ON NEGOCIO.ID_Estado = ESTADO.ID_Estado
WHERE NEGOCIO.ID_Usuario = @ID_Usuario
	AND (
		@FiltroEstado = 'TODOS'
		OR (
			@FiltroEstado = 'ACTIVOS'
			AND NEGOCIO.ID_Estado = @ESTADO_ACTIVO
		)
		OR (
			@FiltroEstado = 'ELIMINADOS'
			AND NEGOCIO.ID_Estado = @ESTADO_ELIMINADO
		)
		OR (
			@FiltroEstado = 'TODOS_SIN_ELIMINADOS'
			AND NEGOCIO.ID_Estado <> @ESTADO_ELIMINADO
		)
	);
-- Mensaje final
SELECT [COD_ALERTA],
	[Nombre],
	[Mensaje],
	[Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'A0019';
END