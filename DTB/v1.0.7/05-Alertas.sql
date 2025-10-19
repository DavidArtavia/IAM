USE [IAMDB];
GO
INSERT INTO [UTIL].[TBL_ALERTAS] ([COD_ALERTA], [Nombre], [Mensaje], [Tipo])
VALUES (
        'B050',
        N'Generar Código Verificación',
        N'Se ha generado y enviado un código de verificación a su correo.',
        'I'
    ),
    (
        'B051',
        N'Reenviado Código Verificación',
        N'Se ha reenviado el código de verificación a su correo.',
        'I'
    ),
    (
        'B052',
        N'Verificación Código Verificación',
        N'Código verificado correctamente. Su cuenta ha sido activada.',
        'I'
    ),
    (
        'B053',
        N'Inválido Código Verificación',
        N'El código ingresado no es válido. Verifique e intente nuevamente.',
        'A'
    ),
    (
        'B054',
        N'Expirado Código Verificación',
        N'El código de verificación ha expirado. Solicite un nuevo código.',
        'A'
    ),
    (
        'B055',
        N'Usuario ya verificado Código Verificación',
        N'Esta cuenta ya fue verificada previamente.',
        'I'
    ),
    (
        'B056',
        N'Pendiente de verificación Código Verificación',
        N'Su cuenta está pendiente de verificación. Revise su correo e ingrese el código de verificación.',
        'A'
    ),
    (
        'B057',
        N'Código no activo Código Verificación',
        N'El código de verificación ya no está activo. Solicite uno nuevo.',
        'A'
    );