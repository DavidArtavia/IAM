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
      Reenvía (regenera) el código de verificación para un usuario:
        - Si el usuario ya está Activo (ID_Estado = 1): retorna B055 (Usuario ya verificado).
        - Si no está Activo:
            * Inactiva (ID_Estado = 33) cualquier código previo "Activo" (ID_Estado = 32).
            * Genera un nuevo código de 4 caracteres (minúsculas).
            * Inserta como "Activo" (ID_Estado = 32) con Fecha_Expiracion = GETDATE() + @MinutosExpiracion.
            * Retorna B051 y, en un segundo result set, el código y su expiración.

    Notas:
      - No se valida la existencia del usuario (la API lo garantiza).
      - Estados TBL_USUARIOS (numérico): Activo = 1.
      - Estados TBL_CODIGO_VERIFICACION (numérico en ID_Estado): 32=Activo, 33=Inactivo, 34=Verificado.

    Alertas utilizadas:
      - B051: Reenviado Código Verificación
      - B055: Usuario ya verificado Código Verificación
*/

CREATE OR ALTER PROCEDURE [SECU].[SP_ReenviarCodigoVerificacion]
    @ID_Usuario         INT,
    @MinutosExpiracion  INT = 15
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @ID_Estado_Usuario INT,
        @Codigo            VARCHAR(10),
        @Expira            DATETIME;

    BEGIN TRY
        BEGIN TRAN;

        -- Estado actual del usuario
        SELECT @ID_Estado_Usuario = U.[ID_Estado]
        FROM [SECU].[TBL_USUARIOS] U
        WHERE U.[ID_Usuario] = @ID_Usuario;

        -- Si ya está Activo (1), no generamos/reenviamos
        IF (@ID_Estado_Usuario = 1)
        BEGIN
            COMMIT TRAN;

            SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo]
            FROM [UTIL].[TBL_ALERTAS]
            WHERE [COD_ALERTA] = 'B055'; -- Usuario ya verificado

            RETURN;
        END

        -- Inactivar códigos previos Activo (ID_Estado=32) del usuario
        UPDATE SECU.[TBL_CODIGO_VERIFICACION]
        SET ID_Estado = 33
        WHERE ID_Usuario = @ID_Usuario
          AND ID_Estado = 32;

        -- Generar código alfanumérico de 4 caracteres (minúsculas)
        DECLARE @Chars NVARCHAR(36) = N'abcdefghijklmnopqrstuvwxyz0123456789';
        DECLARE @i INT = 1, @len INT = 4;
        SET @Codigo = '';

        WHILE (@i <= @len)
        BEGIN
            SET @Codigo = @Codigo + SUBSTRING(@Chars, 1 + (ABS(CHECKSUM(NEWID())) % LEN(@Chars)), 1);
            SET @i = @i + 1;
        END

        -- Calcular expiración
        SET @Expira = DATEADD(MINUTE, ISNULL(@MinutosExpiracion, 15), GETDATE());

        -- Insertar el nuevo código como "Activo" (ID_Estado=32)
        INSERT INTO SECU.[TBL_CODIGO_VERIFICACION]
            (ID_Usuario, COD_Alfa_Num, Fecha_Expiracion, ID_Estado)
        VALUES
            (@ID_Usuario, @Codigo, @Expira, 32);

        COMMIT TRAN;

        -- 1) Alerta de éxito (B051)
        SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo]
        FROM [UTIL].[TBL_ALERTAS]
        WHERE [COD_ALERTA] = 'B051';

        -- 2) Datos del código generado (para envío por correo)
        SELECT
            @Codigo  AS CODIGO_ALFA_NUM,
            @Expira  AS FECHA_EXPIRACION;
    END TRY
    BEGIN CATCH
        IF (XACT_STATE() <> 0) ROLLBACK TRAN;

        DECLARE
            @ErrNum INT = ERROR_NUMBER(),
            @ErrLine INT = ERROR_LINE(),
            @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();

        RAISERROR('Error en SECU.SP_ReenviarCodigoVerificacion. Número: %d, Línea: %d, Mensaje: %s', 16, 1, @ErrNum, @ErrLine, @ErrMsg);
        RETURN;
    END CATCH
END
GO