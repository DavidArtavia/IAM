USE [IAMDB]
GO
    /****** Object:  StoredProcedure [CORE].[SP_ObtenerProformas]    Script Date: 18/8/2025 17:30:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO -- Autor: David Artavia Arias
    -- Fecha: 14/08/2025
    -- Descripción: Lista proformas por negocio con filtros opcionales
    -- Estados (TBL_PROFORMAS): 26=Borrador, 27=Aprobada, 28=Anulada, 31=Eliminado
    -- =============================================
    ALTER PROCEDURE [CORE].[SP_ObtenerProformas] @ID_Negocio INT,
    @ID_Cliente INT = NULL,
    @ID_Estado INT = NULL -- 26/27/28; NULL = todos menos eliminados
    AS BEGIN
SET NOCOUNT ON;
-- 1) Datos
SELECT P.*,
    CAST(
        ISNULL(
            (
                SELECT SUM(
                        CAST(I.PrecioItemProforma AS DECIMAL(16, 3)) * CAST(I.CantidadItemProforma AS DECIMAL(16, 3))
                    )
                FROM CORE.TBL_PROFORMAS_ITEMS I
                WHERE I.ID_Proforma = P.ID_Proforma
                    AND I.ID_Estado = 29
            ),
            0
        ) AS DECIMAL(16, 3)
    ) AS TotalCalculado,
    E.Nombre AS EstadoNombre
FROM CORE.TBL_PROFORMAS P
    LEFT JOIN UTIL.TBL_ESTADOS E ON E.ID_Estado = P.ID_Estado
WHERE P.ID_Negocio = @ID_Negocio
    AND (
        @ID_Cliente IS NULL
        OR P.ID_Cliente = @ID_Cliente
    )
    AND (
        @ID_Estado IS NULL
        OR P.ID_Estado = @ID_Estado
    )
    AND(P.ID_Estado <> 31) -- Excluye Eliminados
ORDER BY P.ID_Proforma DESC;
-- 2) Alerta
SELECT COD_ALERTA,
    Nombre,
    Mensaje,
    Tipo
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = 'B047';
END