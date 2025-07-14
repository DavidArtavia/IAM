UPDATE [UTIL].[TBL_ALERTAS]
SET [Nombre] = N'Registro Cuenta',
    [Mensaje] = N'El negocio especificado no existe.',
    [Tipo] = 'E'
WHERE [COD_ALERTA] = 'B009';
UPDATE [UTIL].[TBL_ALERTAS]
SET [Nombre] = N'Registro Cuenta',
    [Mensaje] = N'La cuenta se registró correctamente.',
    [Tipo] = 'I'
WHERE [COD_ALERTA] = 'B008';
UPDATE [UTIL].[TBL_ALERTAS]
SET [Nombre] = N'Registro Cuenta',
    [Mensaje] = N'El estado especificado no existe.',
    [Tipo] = 'E'
WHERE [COD_ALERTA] = 'B010';
UPDATE [UTIL].[TBL_ALERTAS]
SET [Nombre] = N'Registro Cuenta',
    [Mensaje] = N 'No se pudo registrar la cuenta.',
    [Tipo] = 'E'
WHERE [COD_ALERTA] = 'B011';
UPDATE [UTIL].[TBL_ALERTAS]
SET [Nombre] = N'Obtener Cuentas',
    [Mensaje] = N'Las cuentas se obtuvieron correctamente.',
    [Tipo] = 'I'
WHERE [COD_ALERTA] = 'B012';
UPDATE [UTIL].[TBL_ALERTAS]
SET [Nombre] = N'Obtener Cuentas',
    [Mensaje] = N 'No se encontraron cuentas para el negocio.',
    [Tipo] = 'I'
WHERE [COD_ALERTA] = 'B013';
UPDATE [UTIL].[TBL_ALERTAS]
SET [Nombre] = N'Obtener Cuentas',
    [Mensaje] = N'El negocio especificado no existe.',
    [Tipo] = 'E'
WHERE [COD_ALERTA] = 'B014';
UPDATE [UTIL].[TBL_ALERTAS]
SET [Nombre] = N'Actualizar Cuentas',
    [Mensaje] = N'La cuenta se actualizó correctamente.',
    [Tipo] = 'I'
WHERE [COD_ALERTA] = 'B015';
UPDATE [UTIL].[TBL_ALERTAS]
SET [Nombre] = N'Actualizar Cuentas',
    [Mensaje] = N'La cuenta especificada no existe.',
    [Tipo] = 'E'
WHERE [COD_ALERTA] = 'B016';
UPDATE [UTIL].[TBL_ALERTAS]
SET [Nombre] = N'Actualizar Cuentas',
    [Mensaje] = N 'No se realizó ninguna modificación en la cuenta.',
    [Tipo] = 'I'
WHERE [COD_ALERTA] = 'B017';