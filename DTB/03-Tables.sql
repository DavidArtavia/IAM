USE [IAMDB]
GO
CREATE TABLE SECU.TBL_USUARIOS
(
	ID_Usuario INT IDENTITY(1,1) NOT NULL, --PK
	NombreUsuario VARCHAR (100 )NOT NULL,
	Apellido VARCHAR(100) NOT NULL,
	TelefonoUsuario VARCHAR(15) NOT NULL,
	CorreoUsuario NVARCHAR(50) NOT NULL,
	Pass NVARCHAR(100) NOT NULL,
	EstadoUsuario INT NOT NULL, --FK
)

CREATE TABLE UTIL.TBL_ESTADOS
(
	ID_Estado INT IDENTITY(1,1) NOT NULL, --PK
	Nombre VARCHAR(50) NOT NULL,
	Tabla VARCHAR(50) NOT NULL, --Nombre de la tabla a la que pertenecen stos estados
)

GO

CREATE TABLE CORE.TBL_NEGOCIOS
(
	ID_Negocio INT IDENTITY(1,1) NOT NULL, --PK
	ID_Usuario INT NOT NULL, --FK
	NombreNegocio VARCHAR (100 ) NOT NULL,
	Descripcion NVARCHAR(255) NULL,
	Direccion NVARCHAR(255) NULL,
    TelefonoNegocio NVARCHAR (20) NULL,
    CorreoNegocio NVARCHAR(100) NULL,
	EstadoNegocio INT NOT NULL, --FK
    FechaRegistro DATETIME DEFAULT GETDATE() NOT NULL,
	ReferenciaJSON NVARCHAR(MAX) NULL --Parámetros que la IA le va a solicitar cuando se haga una orden de servicio para este negocio
)

GO

CREATE TABLE CORE.TBL_CLIENTES
(
	ID_Cliente INT IDENTITY(1,1) NOT NULL, --PK
	ID_Usuario INT NOT NULL, --FK
	NombreCliente VARCHAR(100) NOT NULL,
	ApellidoCliente VARCHAR(100) NOT NULL,
	TelefonoCliente VARCHAR(15) NULL,
	CorreoCliente NVARCHAR(50) NULL,
)

GO

CREATE TABLE CORE.TBL_ORDENES_SERVICIO
(
	ID_OrdenServicio INT IDENTITY(1,1) NOT NULL, --PK
	ID_Cliente INT NOT NULL, --FK
	ID_Negocio  INT NOT NULL, --FK
	FechaOrdenServicio DATETIME DEFAULT GETDATE() NOT NULL, --Fecha en la que se crea la orden de servicio
	FechaEstimadaEntrega DATETIME NULL, --Fecha en la que se espera entregar el trabajo
	FechaInicio DATETIME NULL, --Fecha en la que se inicia el trabajo
	FechaFinal DATETIME NULL, --Fecha en la que se termina el trabajo
	FechaEntrega DATETIME NULL, --Fecha en la que se entrega el trabajo
	ReferenciaJSON NVARCHAR(MAX) NULL, --Referencias adicionales que se piden según lo configurado para el negocio (Placa, año, marca)
	EstadoOrdenServicio INT NOT NULL, --FK
	NotaOrdenServicio VARCHAR(255) NULL
)