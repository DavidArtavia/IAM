--Se coloca N para que se interprete como NVARCHAR segun la configuracion de la base de datos
INSERT INTO [UTIL].[TBL_ALERTAS] ([COD_ALERTA], [Nombre], [Mensaje], [Tipo]) VALUES
-- Bloque anterior
('A001', N'Registro de usuario', N'Usuario registrado correctamente', 'I'),
('A002', N'Registro de usuario', N'Ya existe un usuario con ese correo', 'E'),
('A003', N'Obtener usuario', N'Correo no encontrado', 'E'),
('A004', N'Autenticación de usuario', N'Inicio de sesión satisfactorio', 'I'),
('A005', N'Autenticación de usuario', N'Usuario en estado inactivo', 'I'),
('A006', N'Autenticación de usuario', N'Correo y contraseña no coinciden', 'E'),
('A007', N'Autenticación de usuario', N'Refresh token guardado correctamente', 'I'),
('A008', N'ChatIA', N'Audio guardado temporalmente', 'I'),
('A009', N'ChatIA', N'Transcrito correctamente', 'I'),
('A0010', N'ChatIA', N'El audio no se pudo entender', 'E'),
('A0011', N'ChatIA', N'Transcripción cancelada', 'E'),
('A0012', N'ChatIA', N'Audio guardado en la nube', 'I'),
('A0013', N'ChatIA', N'El audio no se pudo guardar en la nube', 'E'),
('A0014', N'ChatIA', N'Mensaje guardado correctamente', 'I'),
('A0015', N'Autenticación de usuario', N'El refresh token no coincide con el usuario', 'E'),
('A0016', N'Autenticación de usuario', N'El refresh token se encuentra revocado', 'E'),
('A0017', N'Autenticación de usuario', N'El refresh token se validó correctamente', 'I'),
('A0018', N'Autenticación de usuario', N'El refresh token se encuentra vencido', 'E'),
('A0019', N'Negocios', N'Negocios obtenidos correctamente', 'I'),
('A0020', N'ChatIA', N'Mensajes obtenidos correctamente', 'I'),
('A0021', N'ChatIA', N'Chats obtenidos correctamente', 'I'),
('A0022', N'Cliente', N'Busqueda de clientes realizada correctamente', 'I'),
('A0023', N'Contexto', N'Contexto consultado correctamente', 'I'),
('A0024', N'Cliente', N'Cliente guardado correctamente', 'I'),
('A0025', N'OrdenServicio', N'Busqueda de orden de servicio realizada correctamente', 'I'),
-- Bloque nuevo
('B001', N'Negocio', N'El negocio se registró exitosamente.', 'I'),
('B002', N'Negocio', N'No puede registrar más de 3 negocios.', 'E'),
('B003', N'Negocio', N'El negocio se actualizó exitosamente.', 'I'),
('B004', N'Negocio', N'Negocio no encontrado.', 'E'),
('B005', N'Actualizar Usuario', N'La información del usuario fue actualizada correctamente.', 'I'),
('B006', N'Actualizar Usuario', N'No se encontró un usuario con el ID proporcionado.', 'E'),
('B007', N'Actualizar Usuario', N'No se aplicaron cambios porque los valores eran iguales o nulos.', 'I'),
('B008', N'Registro CuentaPorPagar', N'La cuenta por pagar se registró correctamente.', 'I'),
('B009', N'Registro CuentaPorPagar', N'El negocio especificado no existe.', 'E'),
('B010', N'Registro CuentaPorPagar', N'El estado especificado no existe.', 'E'),
('B011', N'Registro CuentaPorPagar', N'No se pudo registrar la cuenta por pagar.', 'E'),
('B012', N'Obtener CuentasPorPagar', N'Las cuentas por pagar se obtuvieron correctamente.', 'I'),
('B013', N'Obtener CuentasPorPagar', N'No se encontraron cuentas por pagar para el negocio.', 'I'),
('B014', N'Obtener CuentasPorPagar', N'El negocio especificado no existe.', 'E'),
('B015', N'Actualizar CuentasPorPagar', N'La cuenta por pagar se actualizó correctamente.', 'I'),
('B016', N'Actualizar CuentasPorPagar', N'La cuenta por pagar especificada no existe.', 'E'),
('B017', N'Actualizar CuentasPorPagar', N'No se realizó ninguna modificación en la cuenta por pagar.', 'I'),
('B018', N'Registrar OrdenServicio', N'La orden de servicio se registró correctamente.', 'I'),
--('B019', N'Registrar OrdenServicio', N'El cliente especificado no existe.', 'E'),
--('B020', N'Registrar OrdenServicio', N'El negocio especificado no existe.', 'E'),
--('B021', N'Registrar OrdenServicio', N'El estado especificado no existe.', 'E'),
--('B022', N'Registrar OrdenServicio', N'No se pudo registrar la orden de servicio.', 'E'),
('B023', N'Actualizar OrdenServicio', N'La orden de servicio se actualizó correctamente.', 'I'),
('B024', N'Actualizar OrdenServicio', N'La orden de servicio especificada no existe.', 'E'),
('B025', N'Actualizar OrdenServicio', N'No se realizaron cambios en la orden de servicio.', 'I'),
('B026', N'Negocio', N'Negocio eliminado correctamente.', 'I'),
('B027', N'Cliente', N'Cliente eliminado correctamente.', 'I'),
('B028', N'Obtener OrdenDeServicios', N'Órdenes obtenidas correctamente.', 'I'),
('B029', N'Actualizar Cliente', N'Los datos del cliente han sido actualizados exitosamente.','I'),
('B030', N'Obtener Cliente', N'Los datos del cliente han sido obtenidos exitosamente.','I'),
('A026', N'Guardar Item Orden De Servicio', N'Item de orden de servicio guardada correctamente','I'),
('A027', N'Actualizar Item Orden De Servicio', N'Item de orden de servicio actualizada correctamente','I'),
('A028', N'Obtener Item Orden De Servicio', N'Item de orden de servicio obtenidas correctamente','I');

GO

INSERT INTO [SECU].[TBL_ROLES]
           ([NombreRol]
           ,[DescripcionRol])
     VALUES
           ('Owner'
           ,'Rol Temporal Mientras se completa las funciones por rol dentro de un negocio, de primera instancia se le asignara directamente al usuario')

USE [IAMDB]
GO

INSERT INTO [CORE].[TBL_NEGOCIOS]
           ([ID_Usuario]
           ,[ID_Estado]
           ,[NombreNegocio]
           ,[Descripcion]
           ,[Direccion]
           ,[TelefonoNegocio]
           ,[CorreoNegocio]
           ,[FechaRegistro]
           ,[ReferenciaJSON])
     VALUES
           (1,4,'Taller Mata','Taller automotris','Sarch�','12345678','123@gmail.com',GETDATE(),'{"PARAMS": ["placa", "marca", "modelo"]}'),
		   (1,4,'Taller Mata 2','Taller automotris','Naranjo','12345678','123@gmail.com',GETDATE(),'{"PARAMS": ["placa", "marca", "modelo"]}')
GO




INSERT INTO [CORE].[TBL_CHAT_IA]
           ([ID_Negocio]
           ,[ID_Estado]
           ,[FechaInicial]
           ,[FechaFinal])
     VALUES
           (1,1,GETDATE(),NULL),
		   (1,1,GETDATE(),NULL),
		   (2,1,GETDATE(),NULL)
GO

INSERT INTO [SECU].[TBL_USUARIOS] (
            ID_Estado,
            ID_Rol,
            NombreUsuario,
            Apellido,
            TelefonoUsuario,
            CorreoUsuario,
            Pass
      )
VALUES -- Usuario admin
      (
            1,
            1,
            'Admin',
            'Principal',
            '88888888',
            'admin@gmail.com',
            '123'
      ),
      -- Usuario inventado
      (
            1,
            1,
            'Admin2',
            'Principal2',
            '87123456',
            'admin2@gmail.com',
            '123'
      );


INSERT INTO [UTIL].[TBL_ESTADOS] ([ID_Estado], [Nombre], [Tabla]) VALUES
(1, 'Activo', 'TBL_USUARIOS'),
(2, 'Inactivo', 'TBL_USUARIOS'),
(3, 'Activo', 'TBL_CHAT_IA'),
(4, 'Activo', 'TBL_NEGOCIOS'),
(5, 'Activo', 'TBL_CUENTAS_POR_PAGAR'),
(6, 'Activo', 'TBL_ORDEN_SERVICIO'),
(7, 'En Proceso', 'TBL_ORDEN_SERVICIO'),
(8, 'En Espera', 'TBL_ORDEN_SERVICIO'),
(9, 'Finalizada', 'TBL_ORDEN_SERVICIO'),
(10, 'Eliminada', 'TBL_ORDEN_SERVICIO'),
(11, 'Eliminada', 'TBL_NEGOCIOS'),
(13, 'Eliminado', 'TBL_CHAT_IA'),
(14, 'Eliminado', 'TBL_CUENTAS_POR_PAGAR'),
(15, 'Archivado', 'TBL_CHAT_IA'),
(16, 'Activo', 'TBL_CLIENTES'),
(17, 'Eliminado', 'TBL_CLIENTES'),
(18, 'Activo', 'TBL_ITEMS_ORDEN_SERVICIO'),
(19, 'Eliminado', 'TBL_ITEMS_ORDEN_SERVICIO');





-- USE [IAMDB] <- no es funcinal xq cambio la tabla 
-- GO

-- INSERT INTO [CORE].[TBL_MENSAJES_CHAT]
--            ([ID_ChatIA]
--            ,[Tipo]
--            ,[TextoMensaje]
--            ,[TranscripcionAudio]
--            ,[RutaAudio]
--            ,[FechaMensaje])
--      VALUES
--            (1,'Usuario','Mensaje 1 de prueba','','',GETDATE()),
-- 		   (1,'IA','Mensaje 2 de prueba','','',GETDATE()),
-- 		   (1,'Usuario','Mensaje 3 de prueba','','',GETDATE()),
-- 		   (1,'IA','Mensaje 4 de prueba','','',GETDATE()),
-- 		   (1,'Usuario','','Una trancripci�n X','https://iamhub7185441083.blob.core.windows.net/audios/11052025215100505.WAV',GETDATE()),
-- 		   (1,'IA','Mensaje 5 de prueba','','',GETDATE()),
-- 		   (2,'Usuario','Mensaje 1 de prueba','','',GETDATE()),
-- 		   (2,'IA','Mensaje 2 de prueba','','',GETDATE())
-- GO



--delete from [UTIL].[TBL_ALERTAS]
