USE [IAMDB]

GO -- =============================================
	-- Autor: David Artavia Arias
	-- Creación: 15/06/2025
	-- Descripción: Procedimiento para obtener los negocios específicos por estados
	-- =============================================
	-- Crear stub si no existe

IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_obtenerNegocios')
BEGIN
	EXEC('CREATE PROCEDURE CORE.SP_obtenerNegocios AS BEGIN SET NOCOUNT ON; END ')
END
GO 
ALTER PROCEDURE [CORE].[SP_obtenerNegocios] @ID_Usuario INT,
	@FiltroEstado VARCHAR(20) = 'Activo' AS BEGIN
SET NOCOUNT ON;
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
	INNER JOIN [UTIL].[TBL_ESTADOS] ESTADO ON NEGOCIO.ID_Estado = ESTADO.ID_Estado AND ESTADO.Nombre = @FiltroEstado
WHERE NEGOCIO.ID_Usuario = @ID_Usuario

-- Mensaje final
SELECT [COD_ALERTA],
	[Nombre],
	[Mensaje],
	[Tipo]
FROM [UTIL].[TBL_ALERTAS]
WHERE [COD_ALERTA] = 'A0019';
END