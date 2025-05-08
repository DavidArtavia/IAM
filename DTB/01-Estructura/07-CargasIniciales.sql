--Cargas iniciales

USE [IAMDB]
GO

INSERT INTO [UTIL].[TBL_ESTADOS]
           ([Nombre]
           ,[Tabla])
     VALUES
           ('Activo'
           ,'TBL_USUARIOS')
GO

INSERT INTO [UTIL].[TBL_ALERTAS]
           ([COD_ALERTA]
           ,[Nombre]
           ,[Mensaje]
		   ,Tipo)
     VALUES
           ('A001','Registro de usuario', 'Usuario registrado correctamente', 'I'),
		   ('A002','Registro de usuario', 'Ya existe un usuario con ese correo', 'E')
GO

INSERT INTO [SECU].[TBL_ROLES]
           ([NombreRol]
           ,[DescripcionRol])
     VALUES
           ('Owner'
           ,'Rol Temporal Mientras se completa las funciones por rol dentro de un negocio, de primera instancia se le asignara directamente al usuario')



