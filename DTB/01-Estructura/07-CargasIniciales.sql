--Cargas iniciales

USE [IAMDB]
GO

INSERT INTO [UTIL].[TBL_ESTADOS]
           ([Nombre]
           ,[Tabla])
     VALUES
           ('Activo','TBL_USUARIOS'),
		   ('Inactivo','TBL_USUARIOS'),
		   ('Activo','TBL_CHAT_IA'),
		   ('Activo','TBL_NEGOCIOS')
GO

INSERT INTO [UTIL].[TBL_ALERTAS]
           ([COD_ALERTA]
           ,[Nombre]
           ,[Mensaje]
		   ,Tipo)
     VALUES
           ('A001','Registro de usuario', 'Usuario registrado correctamente', 'I'),
		   ('A002','Registro de usuario', 'Ya existe un usuario con ese correo', 'E'),
		   ('A003','Obtener usuario', 'Correo no encontrado', 'E'),
		   ('A004','Autenticación de usuario', 'Inicio de sesión satisfactorio', 'I'),
		   ('A005','Autenticación de usuario', 'Usuario en estado inactivo', 'I'),
		   ('A006','Autenticación de usuario', 'Correo y contraseña no coinciden', 'E'),
		   ('A007','Autenticación de usuario', 'Refresh token guardado correctamente', 'I'),
		   ('A008','ChatIA', 'Audio guardado temporalemnte', 'I'),
		   ('A009','ChatIA', 'Transcrito correctamente', 'I'),
		   ('A0010','ChatIA', 'El audio no se pudo entender', 'E'),
		   ('A0011','ChatIA', 'Transcripcion cancelada', 'E'),
		   ('A0012','ChatIA', 'Audio guardado en la nuve', 'I'),
		   ('A0013','ChatIA', 'El audio no se pudo guardar en la nuve', 'E'),
		   ('A0014','ChatIA', 'Mensaje guardado correctamente', 'I'),
		   ('A0015','Autenticación de usuario', 'El refresh token no coincide con el usuario', 'E'),
		   ('A0016','Autenticación de usuario', 'El refresh token se encuentra revocado', 'E'),
		   ('A0017','Autenticación de usuario', 'El refresh token se validó correctamente', 'I'),
		   ('A0018','Autenticación de usuario', 'El refresh token se encuentra vencido', 'E'),
		   ('A0019','Negocios', 'Negocios obtenidos correctamente', 'I'),
		   ('A0020','ChatIA', 'Mensajes obtenidos correctamente', 'I'),
		   ('A0021','ChatIA', 'Chats obtenidos correctamente', 'I')
		   
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
           (3,4,'Taller Mata','Taller automotris','Sarchí','12345678','123@gmail.com',GETDATE(),'{"PARAMS": ["placa", "marca", "modelo"]}'),
		   (3,4,'Taller Mata 2','Taller automotris','Naranjo','12345678','123@gmail.com',GETDATE(),'{"PARAMS": ["placa", "marca", "modelo"]}')
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



USE [IAMDB]
GO

INSERT INTO [CORE].[TBL_MENSAJES_CHAT]
           ([ID_ChatIA]
           ,[Tipo]
           ,[TextoMensaje]
           ,[TranscripcionAudio]
           ,[RutaAudio]
           ,[FechaMensaje])
     VALUES
           (1,'Usuario','Mensaje 1 de prueba','','',GETDATE()),
		   (1,'IA','Mensaje 2 de prueba','','',GETDATE()),
		   (1,'Usuario','Mensaje 3 de prueba','','',GETDATE()),
		   (1,'IA','Mensaje 4 de prueba','','',GETDATE()),
		   (1,'Usuario','','Una trancripción X','https://iamhub7185441083.blob.core.windows.net/audios/11052025215100505.WAV',GETDATE()),
		   (1,'IA','Mensaje 5 de prueba','','',GETDATE()),
		   (2,'Usuario','Mensaje 1 de prueba','','',GETDATE()),
		   (2,'IA','Mensaje 2 de prueba','','',GETDATE())
GO



--delete from [UTIL].[TBL_ALERTAS]
