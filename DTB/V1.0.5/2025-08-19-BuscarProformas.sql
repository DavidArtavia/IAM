USE [IAMDB];
GO
 IF NOT EXISTS (
        SELECT 1
        FROM sys.procedures
        WHERE name = 'SP_buscarProformas'
            AND schema_id = SCHEMA_ID('CORE')
    ) BEGIN EXEC(
        'CREATE PROCEDURE CORE.SP_buscarProformas AS BEGIN SET NOCOUNT ON; END'
    );
END
GO 
-- =============================================
-- Autor: David Artavia Arias
-- Fecha: 19/08/2025
-- Descripción: Búsqueda única por texto/número en proformas (cliente, estado, observación y total).
-- =============================================
    ALTER PROCEDURE CORE.SP_buscarProformas 
    @ID_Negocio INT,
    @Term NVARCHAR(100) = N'' AS BEGIN
SET NOCOUNT ON;
-- Normaliza el query
SET @Term = LTRIM(RTRIM(ISNULL(@Term, N'')));
-- Intenta parsear a números (para búsqueda por total)
DECLARE @QInt INT = TRY_CONVERT(INT, @Term);
-- por si quisieras habilitar ID_Proforma
DECLARE @QDec DECIMAL(16, 3) = TRY_CONVERT(DECIMAL(16, 3), @Term);
-- total exacto si aplica
;
WITH Base AS (
    SELECT P.ID_Proforma,
        P.ID_Negocio,
        P.ID_Cliente,
        P.ID_Estado,
        P.FechaProforma,
        P.FechaVencimiento,
        P.ObservacionProforma,
        P.FechaModificacion,
        E.Nombre AS EstadoNombre,
        C.NombreCliente,
        C.ApellidoCliente
    FROM CORE.TBL_PROFORMAS P
        LEFT JOIN UTIL.TBL_ESTADOS E ON E.ID_Estado = P.ID_Estado
        LEFT JOIN CORE.TBL_CLIENTES C ON C.ID_Cliente = P.ID_Cliente
    WHERE P.ID_Negocio = @ID_Negocio
        AND P.ID_Estado <> 31 -- excluye Eliminadas
),
Tot AS (
    SELECT I.ID_Proforma,
        CAST(
            ISNULL(
                SUM(
                    CAST(I.PrecioItemProforma AS DECIMAL(16, 3)) * CAST(I.CantidadItemProforma AS DECIMAL(16, 3))
                ),
                0
            ) AS DECIMAL(16, 3)
        ) AS TotalCalculado
    FROM CORE.TBL_PROFORMAS_ITEMS I
    WHERE I.ID_Estado = 29 -- ítems activos
    GROUP BY I.ID_Proforma
)
SELECT B.ID_Proforma,
    B.ID_Negocio,
    B.ID_Cliente,
    B.ID_Estado,
    B.FechaProforma,
    B.FechaVencimiento,
    B.ObservacionProforma,
    B.FechaModificacion,
    B.EstadoNombre,
    B.NombreCliente,
    B.ApellidoCliente,
    ISNULL(T.TotalCalculado, 0) AS TotalCalculado
FROM Base B
    LEFT JOIN Tot T ON T.ID_Proforma = B.ID_Proforma
WHERE 
    (@Term = N'')
    OR (
        -- Texto: Observación, Cliente, Estado
        (
            B.ObservacionProforma IS NOT NULL
            AND B.ObservacionProforma LIKE N'%' + @Term + N'%'
        )
        OR (
            B.NombreCliente IS NOT NULL
            AND B.NombreCliente LIKE N'%' + @Term + N'%'
        )
        OR (
            B.ApellidoCliente IS NOT NULL
            AND B.ApellidoCliente LIKE N'%' + @Term + N'%'
        )
        OR (
            B.EstadoNombre IS NOT NULL
            AND B.EstadoNombre LIKE N'%' + @Term + N'%'
        ) -- Numérico (total): exacto o “contenga”
        OR (
            @QDec IS NOT NULL
            AND (
                ISNULL(T.TotalCalculado, 0) = @QDec
                OR CONVERT(NVARCHAR(50), ISNULL(T.TotalCalculado, 0)) LIKE N'%' + @Term + N'%'
            )
        ) -- Si quisieras permitir ID_Proforma escribiendo un entero (opcional):
        -- OR (@QInt IS NOT NULL AND B.ID_Proforma = @QInt)
    )
ORDER BY B.ID_Proforma DESC;
IF @@ROWCOUNT = 0 BEGIN
SELECT COD_ALERTA,
    Nombre,
    Mensaje,
    Tipo
FROM UTIL.TBL_ALERTAS
WHERE COD_ALERTA = 'B049';
END
END
GO