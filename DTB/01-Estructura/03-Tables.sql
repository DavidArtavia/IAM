USE [IAMDB]
GO
CREATE TABLE SECU.TBL_USUARIOS
(
	ID_Usuario INT IDENTITY(1,1) NOT NULL, --PK
	ID_Estado INT NOT NULL, --FK
	ID_Rol INT NOT NULL,-- FK
	NombreUsuario VARCHAR (100 )NOT NULL,
	Apellido VARCHAR(100) NOT NULL,
	TelefonoUsuario VARCHAR(15) NOT NULL,
	CorreoUsuario NVARCHAR(50) NOT NULL,
	Pass NVARCHAR(255) NOT NULL
)
GO

CREATE TABLE SECU.TBL_Roles
(
	ID_Rol INT IDENTITY(1,1) NOT NULL, --PK
	ID_Usuario INT  NOT NULL, --FK
	NombreRol VARCHAR (100 )NOT NULL,
	DescripcionRol VARCHAR(255) NOT NULL
)
GO

CREATE TABLE SECU.TBL_SESIONES
(
	ID_SESION INT IDENTITY(1,1) NOT NULL, --PK
	ID_Usuario INT, --FK
	RefreshToken NVARCHAR(255) NOT NULL,
	FechaCreacion DATETIME DEFAULT GETDATE() NOT NULL,
	FechaExpiracion DATETIME NOT NULL,
	Revocado BIT DEFAULT 0 NOT NULL,
	FechaRevocado DATETIME NULL,
	ReemplazadoPorToken NVARCHAR(255) NULL,
	UserAgent NVARCHAR(255) NULL, 
    IPUsuario NVARCHAR(45) NULL
)
GO

CREATE TABLE UTIL.TBL_ESTADOS
(
	ID_Estado INT IDENTITY(1,1) NOT NULL, --PK
	Nombre VARCHAR(50) NOT NULL,
	Tabla VARCHAR(50) NOT NULL --Nombre de la tabla a la que pertenecen stos estados
)
GO

CREATE TABLE CORE.TBL_NEGOCIOS
(
	ID_Negocio INT IDENTITY(1,1) NOT NULL, --PK
	ID_Usuario INT NOT NULL, --FK
	ID_Estado INT NOT NULL, --FK
	NombreNegocio VARCHAR (100 ) NOT NULL,
	Descripcion NVARCHAR(255) NULL,
	Direccion NVARCHAR(255) NULL,
    TelefonoNegocio NVARCHAR (20) NULL,
    CorreoNegocio NVARCHAR(100) NULL,
    FechaRegistro DATETIME DEFAULT GETDATE() NOT NULL,
	ReferenciaJSON NVARCHAR(MAX) CHECK (ISJSON(ReferenciaJSON) > 0) NULL --Parámetros que la IA le va a solicitar cuando se haga una orden de servicio para este negocio
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
	ID_Estado INT NOT NULL, --FK
	FechaOrdenServicio DATETIME DEFAULT GETDATE() NOT NULL, --Fecha en la que se crea la orden de servicio
	FechaEstimadaEntrega DATETIME NULL, --Fecha en la que se espera entregar el trabajo
	FechaInicio DATETIME NULL, --Fecha en la que se inicia el trabajo
	FechaFinal DATETIME NULL, --Fecha en la que se termina el trabajo
	FechaEntrega DATETIME NULL, --Fecha en la que se entrega el trabajo
	ReferenciaJSON NVARCHAR(MAX) CHECK (ISJSON(ReferenciaJSON) > 0) NULL, --Referencias adicionales que se piden según lo configurado para el negocio (Placa, año, marca)
	NotaOrdenServicio VARCHAR(255) NULL
)
GO

CREATE TABLE CORE.TBL_TRANSACCIONES
(
	ID_Transaccion INT IDENTITY(1,1) NOT NULL, --PK
	ID_Negocio  INT NOT NULL, --FK
	Concepto VARCHAR(100) NOT NULL,
	Monto DECIMAL(16,3) NOT NULL,
	Tipo VARCHAR(50) NOT NULL, --Ingreso/Gasto
	NumReferencia VARCHAR(100) NULL,
	TipoNumReferencia VARCHAR(50) NULL, --OrdenServicio, CuentasPorCobrar, Alquiler, Luz, Otro
	FechaTransaccion DATETIME DEFAULT GETDATE() NOT NULL
)
GO

CREATE TABLE CORE.TBL_ITEMS_ORDEN_SERVICIO
(
	ID_ItemOrdenServicio INT IDENTITY(1,1) NOT NULL, --PK
	ID_OrdenServicio INT NOT NULL, --FK
	ID_Estado INT NOT NULL, --FK
	NombreItemOrdenServicio VARCHAR(100) NOT NULL,
	Descripción VARCHAR(255) NULL,
	Monto DECIMAL(16,3) NOT NULL,
	Avance INT NULL
)
GO

CREATE TABLE CORE.TBL_CUENTAS_POR_PAGAR
(
	ID_CuentasPorPagar INT IDENTITY(1,1) NOT NULL, --PK
	ID_Negocio INT NOT NULL, --FK
	ID_Estado INT NOT NULL, --FK
	Concepto VARCHAR(50) NOT NULL,
	Descripcion VARCHAR(255) NOT NULL,
	Saldo DECIMAL(16,3) NOT NULL,
	FechaInicial DATETIME DEFAULT GETDATE() NOT NULL,
	FechaModificacion DATETIME NOT NULL
	
	
)
GO

CREATE TABLE CORE.TBL_CHAT_IA 
(
    ID_ChatIA INT IDENTITY(1,1) NOT NULL, --PK
    ID_Negocio INT NOT NULL, --FK
    ID_Estado INT NOT NULL, --FK (Activa, Cancelada, Completada)
    FechaInicial DATETIME DEFAULT GETDATE() NOT NULL,
    FechaFinal DATETIME NULL,
)
GO

CREATE TABLE CORE.TBL_MENSAJES_CHAT 
(
    ID_Mensaje INT IDENTITY(1,1) NOT NULL, --PK
    ID_ChatIA INT NOT NULL,-- FK
    Tipo NVARCHAR(10) CHECK (Tipo IN ('Usuario', 'IA')) NOT NULL, -- Quien lo dijo
    TextoMensaje NVARCHAR(500) NULL,
    TranscripcionAudio NVARCHAR(500) NULL, -- si es entrada por voz
	RutaAudio NVARCHAR(500) NULL,
    FechaMensaje DATETIME DEFAULT GETDATE() NOT NULL
)
GO
--La siguiente tabla tiene por fin guardar lo que se identifica que el usuario quiere hacer en un determinado chat con la IA
--en el momento que se detecte lo que quiere hacer dentro de una conversación, se guarda un registro acá para darle seguinmiento
--además dentro del sistema se valida una lógica (CAPA APP) para entender todos los parámetros que son requeridos y guardarlos en otra tabla
--para darle seguimiento hasta tener todos los parámetros y ejecutar la acción
CREATE TABLE CORE.TBL_INTENCIONES_DETECTADAS (
    ID_Intencion INT IDENTITY(1,1) NOT NULL,
    ID_ChatIA INT NOT NULL, --FK
	ID_Estado INT NOT NULL, --FK -- En progreso, completada, cancelada
    NombreIntencion NVARCHAR(100), --Mismo nombre que el método que realiza la intención en el API
    FechaDeteccion DATETIME DEFAULT GETDATE() NOT NULL,
	FechaEjecucion DATETIME DEFAULT GETDATE() NULL,
	Resultado NVARCHAR(255) NULL-- Éxito, error, validación fallida y cualquier otra vara que salga (si es error se ampliara en los LOGs
)
GO

CREATE TABLE CORE.TBL_PARAMETROS_POR_INTENCION (
    ID_Parametro INT IDENTITY(1,1) NOT NULL, --PK
    ID_Intencion INT NOT NULL, --FK
	ID_Estado INT NOT NULL, -- FK Pendiente, Capturado
    NombreParametro NVARCHAR(100) NOT NULL, -- Ej. NombreCliente
    ValorCapturado NVARCHAR(255) NULL,
    FechaUltimaActualizacion DATETIME DEFAULT GETDATE() NOT NULL,
	EsRequerido BIT DEFAULT 1
)
GO

CREATE TABLE UTIL.TBL_LOG_ERRORES
(
	ID_LOG INT IDENTITY(1,1) NOT NULL, --PK
	CodigoError NVARCHAR(50) NOT NULL,
	NombreError NVARCHAR(100) NOT NULL,
	DetalleError NVARCHAR(4000) NOT NULL,
	CapaError VARCHAR(20) NOT NULL, --WEB, APP, IA, DB, OTROS
)
GO

