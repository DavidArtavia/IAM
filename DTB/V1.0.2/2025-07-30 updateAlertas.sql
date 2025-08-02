USE [IAMDB]
GO
UPDATE [UTIL].[TBL_ALERTAS]
SET [Mensaje] = 'No puede registrar más de 3 negocios con el plan básico de uso'
WHERE [COD_ALERTA] = 'B002'
GO