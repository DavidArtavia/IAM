USE [IAMDB]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
    Autor: David Artavia Arias
    Creación: 18/10/2025
    Descripción:
      Valida un código de verificación para un usuario:
        - Si el usuario ya está Activo (ID_Estado = 1): retorna B055.
        - Si hay un código Activo (ID_Estado = 32) que coincide y no está expirado: marca "Verificado" (ID_Estado = 34),
          activa al usuario (ID_Estado = 1) y retorna B052.
        - Si el código Activo coincide pero está expirado: lo marca "Inactivo" (ID_Estado = 33) y retorna B054.
        - Si el código existe pero no está Activo: retorna B057.
        - Si no existe el código para el usuario: retorna B053.

    Notas:
      - La API garantiza que el usuario existe; no se valida existencia en este SP.
      - Estados de usuario (numérico): Activo = 1.
      - Estados en SECU.TBL_CODIGO_VERIFICACION (numéricos): 32=Activo, 33=Inactivo, 34=Verificado.
*/

CREATE OR ALTER PROCEDURE [SECU].[SP_ValidarCodigoVerificacion]
    @ID_Usuario INT,
    @Codigo     VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @ID_Estado_Usuario        INT,
        @ID_CodVerif_MatchActivo  INT,
        @Expiracion_Match         DATETIME;

    BEGIN TRY
        BEGIN TRAN;

        -- 0) Usuario ya activo => no requiere verificación
        SELECT @ID_Estado_Usuario = U.[ID_Estado]
        FROM [SECU].[TBL_USUARIOS] U
        WHERE U.[ID_Usuario] = @ID_Usuario;

        IF (@ID_Estado_Usuario = 1)
        BEGIN
            COMMIT TRAN;
            SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo]
            FROM [UTIL].[TBL_ALERTAS]
            WHERE [COD_ALERTA] = 'B055'; -- Usuario ya verificado
            RETURN;
        END

        -- 1) Buscar match exacto de código en estado Activo (32) (case-insensitive)
        SELECT TOP (1)
            @ID_CodVerif_MatchActivo = CV.[ID_COD_Verificacion],
            @Expiracion_Match        = CV.[Fecha_Expiracion]
        FROM SECU.[TBL_CODIGO_VERIFICACION] CV
        WHERE CV.[ID_Usuario] = @ID_Usuario
          AND CV.[ID_Estado] = 32
          AND LOWER(CV.[COD_Alfa_Num]) = LOWER(@Codigo)
        ORDER BY CV.[ID_COD_Verificacion] DESC;

        IF (@ID_CodVerif_MatchActivo IS NOT NULL)
        BEGIN
            -- 1.a) Si match activo y no expiró => éxito
            IF (@Expiracion_Match > GETDATE())
            BEGIN
                -- Marcar código como Verificado (34)
                UPDATE SECU.[TBL_CODIGO_VERIFICACION]
                SET ID_Estado = 34
                WHERE ID_COD_Verificacion = @ID_CodVerif_MatchActivo;

                -- Inactivar cualquier otro código Activo (32) de ese usuario
                UPDATE SECU.[TBL_CODIGO_VERIFICACION]
                SET ID_Estado = 33
                WHERE ID_Usuario = @ID_Usuario
                  AND ID_Estado = 32
                  AND ID_COD_Verificacion <> @ID_CodVerif_MatchActivo;

                -- Activar usuario
                UPDATE SECU.[TBL_USUARIOS]
                SET ID_Estado = 1 -- Activo
                WHERE ID_Usuario = @ID_Usuario;

                COMMIT TRAN;

                SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo]
                FROM [UTIL].[TBL_ALERTAS]
                WHERE [COD_ALERTA] = 'B052'; -- Verificación exitosa
                RETURN;
            END
            ELSE
            BEGIN
                -- 1.b) Match activo pero expirado => marcar como Inactivo (33) y alertar expiración
                UPDATE SECU.[TBL_CODIGO_VERIFICACION]
                SET ID_Estado = 33
                WHERE ID_COD_Verificacion = @ID_CodVerif_MatchActivo;

                COMMIT TRAN;

                SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo]
                FROM [UTIL].[TBL_ALERTAS]
                WHERE [COD_ALERTA] = 'B054'; -- Código expirado
                RETURN;
            END
        END

        -- 2) Si no hay match activo, verificar si ese código existe pero no está Activo (<>32)
        IF EXISTS (
            SELECT 1
            FROM SECU.[TBL_CODIGO_VERIFICACION] CV
            WHERE CV.[ID_Usuario] = @ID_Usuario
              AND LOWER(CV.[COD_Alfa_Num]) = LOWER(@Codigo)
              AND CV.[ID_Estado] <> 32
        )
        BEGIN
            COMMIT TRAN;

            SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo]
            FROM [UTIL].[TBL_ALERTAS]
            WHERE [COD_ALERTA] = 'B057'; -- Código no activo
            RETURN;
        END

        -- 3) En cualquier otro caso => código inválido
        COMMIT TRAN;

        SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo]
        FROM [UTIL].[TBL_ALERTAS]
        WHERE [COD_ALERTA] = 'B053'; -- Código inválido
    END TRY
    BEGIN CATCH
        IF (XACT_STATE() <> 0) ROLLBACK TRAN;

        DECLARE
            @ErrNum INT = ERROR_NUMBER(),
            @ErrLine INT = ERROR_LINE(),
            @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();

        RAISERROR('Error en SECU.SP_ValidarCodigoVerificacion. Número: %d, Línea: %d, Mensaje: %s', 16, 1, @ErrNum, @ErrLine, @ErrMsg);
        RETURN;
    END CATCH
END
GO