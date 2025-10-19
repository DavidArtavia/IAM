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
      Genera un código de verificación para un usuario específico, invalida códigos previos activos,
      y retorna la alerta B050 junto con el código y su expiración para envío por correo.
      Si el usuario ya está Activo (ID_Estado = 1), no genera código y retorna B055.

    Notas:
      - La API valida existencia del usuario.
      - Estados de usuario (numéricos fijos): Activo = 1; Por Validar = 35 (no requerido aquí).
      - Estados en TBL_CODIGO_VERIFICACION: ID_Estado = 32 (Activo), 33 (Inactivo), 34 (Verificado).
*/

CREATE OR ALTER PROCEDURE [SECU].[SP_GenerarCodigoVerificacion]
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

        -- Estado actual del usuario (sin validar existencia explícita)
        SELECT @ID_Estado_Usuario = U.[ID_Estado]
        FROM [SECU].[TBL_USUARIOS] U
        WHERE U.[ID_Usuario] = @ID_Usuario;

        -- Si ya está Activo (1), no generamos un nuevo código
        IF (@ID_Estado_Usuario = 1)
        BEGIN
            COMMIT TRAN;

            SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo]
            FROM [UTIL].[TBL_ALERTAS]
            WHERE [COD_ALERTA] = 'B055'; -- Usuario ya verificado

            RETURN;
        END

        -- Inactivar códigos previos Activo del usuario (ID_Estado = 32 -> 33)
        UPDATE SECU.[TBL_CODIGO_VERIFICACION]
        SET ID_Estado = 33 -- Inactivo
        WHERE ID_Usuario = @ID_Usuario
          AND ID_Estado = 32; -- Activo

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

        -- Insertar el nuevo código como Activo (ID_Estado = 32)
        INSERT INTO SECU.[TBL_CODIGO_VERIFICACION]
            (ID_Usuario, COD_Alfa_Num, Fecha_Expiracion, ID_Estado)
        VALUES
            (@ID_Usuario, @Codigo, @Expira, 32); -- Activo

        COMMIT TRAN;

        -- 1) Alerta de éxito (B050)
        SELECT [COD_ALERTA],[Nombre],[Mensaje],[Tipo]
        FROM [UTIL].[TBL_ALERTAS]
        WHERE [COD_ALERTA] = 'B050';

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

        RAISERROR('Error en SECU.SP_GenerarCodigoVerificacion. Número: %d, Línea: %d, Mensaje: %s', 16, 1, @ErrNum, @ErrLine, @ErrMsg);
        RETURN;
    END CATCH
END
GO