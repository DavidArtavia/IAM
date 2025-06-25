USE [IAMDB]
GO -- =============================================
    -- Autor: David Artavia Arias
    -- Fecha: 17/06/2025
    -- Descripción: Crea un nuevo chat IA para un negocio y devuelve los datos insertados
    -- =============================================
    -- Crear stub si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM sys.procedures
        WHERE name = 'SP_crearChatIA'
    ) BEGIN EXEC(
        'CREATE PROCEDURE CORE.SP_crearChatIA AS BEGIN SET NOCOUNT ON; END '
    )
END
GO -- Procedimiento real
ALTER PROCEDURE [CORE].[SP_crearChatIA] 
    @ID_Negocio INT
AS
BEGIN
    SET NOCOUNT ON;	

    
    INSERT INTO [CORE].[TBL_CHAT_IA] (
        ID_Negocio,
        ID_Estado,
        FechaInicial
    )
    OUTPUT 
        inserted.ID_ChatIA,
        inserted.ID_Negocio,
        inserted.ID_Estado,
        inserted.FechaInicial,
        inserted.FechaFinal 
    VALUES (
        @ID_Negocio,
        3,
        GETDATE()
    );

    -- Alerta de éxito
    SELECT [COD_ALERTA],
        [Nombre],
        [Mensaje],
        [Tipo]
    FROM [UTIL].[TBL_ALERTAS]
    WHERE [COD_ALERTA] = 'B031';
END
