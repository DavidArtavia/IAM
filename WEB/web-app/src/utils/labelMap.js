//#region columnas de tablas
//  Define configuraciones de campos de formulario (FieldConfig) para construir formularios dinámicos relacionados con estos modelos.
// Los label maps permiten mostrar nombres amigables en la UI, y los arreglos de campos de formulario se usan para generar formularios de manera flexible.
export const columnKeysCuenta = [
    "iD_Cuenta",
    "concepto",
    "monto",
    "fechaInicial",
    "fechaLimite",
    "tipoCuenta",
    "iD_OrdenServicio",
];
export const columnKeysNegocio = [
    "iD_Negocio",
    "nombreNegocio",
    "descripcion",
    "direccion",
    "telefonoNegocio",
    "correoNegocio",
    "fechaRegistro"
];
export const columnKeysOrdenDeServicio = [
    "iD_OrdenServicio",
    "fechaOrdenServicio",
    "fechaEstimadaEntrega",
    "notaOrdenServicio"
];
export const columnKeysCliente = [
    "iD_Cliente",
    "nombreCliente",
    "apellidoCliente",
    "telefonoCliente",
    "correoCliente",
];
export const columnKeysItemsOrdenServicio = [
    "iD_ItemOrdenServicio",
    "iD_OrdenServicio",
    "nombreItemOrdenServicio",
    "descripcion",
    "monto",
];
export const columnKeysTransacciones = [
    "iD_Transaccion",
    "iD_Negocio",
    "fechaTransaccion",
    "concepto",
    "monto",
    "tipo",
    "tipoNumReferencia",
    "numReferencia",
];
//#endregion
//#region modal para visualizar detalles de objetos
// Define los atributos que se mostrarán en el infoModal de las filas de las tablas de los modelos.
export const keysInfoModalOrdenDeServicio = [
    "iD_OrdenServicio",
    "fechaOrdenServicio",
    "fechaEstimadaEntrega",
    "fechaInicio",
    "fechaFinal",
    "fechaEntrega",
    "notaOrdenServicio",
    "referenciaJSON",
    "estado",
];
export const keysInfoModalNegocio = [
    "iD_Negocio",
    "nombreNegocio",
    "descripcion",
    "direccion",
    "telefonoNegocio",
    "correoNegocio",
    "fechaRegistro",
    "estado",
    "referenciaJSON"
];
export const keysInfoModalCuenta = [
    "iD_Cuenta",
    "concepto",
    "descripcion",
    "fechaInicial",
    "fechaLimite",
    "tipoCuenta",
    "iD_OrdenServicio",
    "detalleJSON",
    "monto",
    "estado",
];
export const keysInfoModalCliente = [
    "iD_Cliente",
    "nombreCliente",
    "apellidoCliente",
    "telefonoCliente",
    "correoCliente",
    "estado",
];
export const keysInfoModalItemsOrdenServicio = [
    "iD_ItemOrdenServicio",
    "iD_OrdenServicio",
    "nombreItemOrdenServicio",
    "descripcion",
    "monto",
    "avance",
    "estado",
];
export const keysInfoModalTransacciones = [
    "iD_Transaccion",
    "iD_Negocio",
    "fechaTransaccion",
    "concepto",
    "monto",
    "tipo",
    "tipoNumReferencia",
    "numReferencia",
    "estado"
];
//#endregion
//#region tablas
// Este archivo define mapas de etiquetas (label maps) para mostrar nombres legibles en los titulos del DataTable de los modelos.
export const labelMapCuenta = {
    iD_Cuenta: "Cuenta #",
    estado: "Estado",
    concepto: "Concepto",
    monto: "Monto",
    fechaInicial: "Fecha Inicial",
    fechaLimite: "Fecha Límite",
    tipoCuenta: "Tipo De Cuenta",
    iD_OrdenServicio: "Orden De Servicio #"
};
export const labelMapNegocio = {
    iD_Negocio: "Negocio #",
    estado: "Estado",
    nombreNegocio: "Nombre",
    descripcion: "Descripción",
    direccion: "Dirección",
    telefonoNegocio: "Teléfono",
    correoNegocio: "Correo",
    fechaRegistro: "Registrado",
    referenciaJSON: "Referencias",
};
export const labelMapOrdenDeServicio = {
    iD_OrdenServicio: "Orden Servicio #",
    estado: "Estado",
    fechaOrdenServicio: "Fecha de servicio",
    fechaEstimadaEntrega: "Entrega Estimada",
    fechaInicio: "Fecha de Inicio",
    fechaFinal: "Fecha Final",
    fechaEntrega: "Fecha de Entrega",
    notaOrdenServicio: "Nota",
    referenciaJSON: "Referencias"
};
export const labelMapCliente = {
    iD_Cliente: "Cliente #",
    nombreCliente: "Nombre",
    apellidoCliente: "Apellido(s)",
    telefonoCliente: "Teléfono",
    correoCliente: "Correo",
    estado: "Estado",
};
export const labelMapItemsOrdenServicio = {
    iD_ItemOrdenServicio: "Item #",
    iD_OrdenServicio: "Orden Servicio #",
    nombreItemOrdenServicio: "Nombre del Item",
    descripcion: "Descripción",
    monto: "Monto",
    avance: "Avance",
    estado: "Estado",
};
export const labelMapTransacciones = {
    iD_Transaccion: "Transacción #",
    iD_Negocio: "Negocio #",
    fechaTransaccion: "Fecha",
    concepto: "Concepto",
    monto: "Monto",
    tipo: "Tipo",
    tipoNumReferencia: "Tipo Referencia",
    numReferencia: "N° Referencia",
    estado: "Estado",
};
//#endregion
//#region campos a mostrar para el form de editar
// Exportación de los campos del formulario editar para los modelos
export const negocioFormEditFields = columnKeysNegocio
    .filter(key => key !== "iD_Negocio" && key !== "iD_Usuario" && key !== "fechaRegistro") // Excluye campos que no se editan
    .map(key => ({
    key,
    label: labelMapNegocio[key] ?? key,
    type: "text",
}));
export const cuentasFormEditFields = [
    {
        key: "fechaInicial",
        label: labelMapCuenta["fechaInicial"] ?? "Fecha Inicial",
        type: "date",
        required: true,
    },
    {
        key: "concepto",
        label: labelMapCuenta["concepto"] ?? "Concepto",
        type: "text",
        required: true,
    },
    {
        key: "descripcion",
        label: labelMapCuenta["descripcion"] ?? "Descripción",
        type: "textarea",
        required: false,
    },
    {
        key: "fechaLimite",
        label: labelMapCuenta["fechaLimite"] ?? "Fecha Límite",
        type: "date",
        required: true,
    },
    {
        key: "tipoCuenta",
        label: labelMapCuenta["tipoCuenta"] ?? "Tipo de Cuenta",
        type: "select",
        required: true,
        options: [
            { label: "Cuenta Por Cobrar", value: "Cuentas Por Cobrar" },
            { label: "Cuenta Por Pagar", value: "Cuenta Por Pagar" },
        ],
    },
];
export const clienteFormEditFields = columnKeysCliente
    .filter(key => key !== "iD_Cliente" && key !== "iD_Usuario") // Excluye campos que no se editan
    .map(key => ({
    key,
    label: labelMapCliente[key] ?? key,
    type: "text",
}));
export const ItemsOrdenServicioFormEditFields = columnKeysItemsOrdenServicio
    .filter(key => key !== "iD_ItemOrdenServicio" && key !== "iD_OrdenServicio" && key != "avance") // Excluye campos que no se editan
    .map(key => ({
    key,
    label: labelMapItemsOrdenServicio[key] ?? key,
    type: key === "monto" ? "number" : "text",
}));
export const ordenServicioFormEditFields = [
    // Campo fechaInicio fijo
    {
        key: "fechaInicio",
        label: labelMapOrdenDeServicio["fechaInicio"] ?? "Fecha de Inicio",
        type: "date", // aquí TS sabe que es literal "date"
    },
    {
        key: "fechaFinal",
        label: labelMapOrdenDeServicio["fechaFinal"] ?? "Fecha Final",
        type: "date", // aquí TS sabe que es literal "date"
    },
    {
        key: "fechaEntrega",
        label: labelMapOrdenDeServicio["fechaEntrega"] ?? "Fecha de Entrega",
        type: "date", // aquí TS sabe que es literal "date"
    },
    // Resto de campos automáticos
    ...columnKeysOrdenDeServicio
        .filter((key) => key !== "referenciaJSON" &&
        key !== "fechaOrdenServicio" &&
        key !== "iD_OrdenServicio" // Excluimos el ID de la orden de servicio
    )
        .map((key) => {
        // convertimos el resultado a un literal
        const fieldType = key.toString().includes("fecha")
            ? "date"
            : "text";
        const config = {
            key,
            label: labelMapOrdenDeServicio[key] ?? String(key),
            type: fieldType, // TS ve aquí un "date" | "text" válido
        };
        return config;
    }),
];
export const transaccionesFormEditFields = [
    { key: "concepto", label: "Concepto", type: "text", required: true },
    { key: "monto", label: "Monto", type: "number", required: true },
    {
        key: "tipo", label: "Tipo", type: "select", required: true, options: [
            { label: "Ingreso", value: "Ingreso" },
            { label: "Gasto", value: "Gasto" },
        ]
    },
    {
        key: "tipoNumReferencia", label: "Tipo Referencia", type: "select", required: true, options: [
            { label: "Luz", value: "Luz" },
            { label: "Internet", value: "Internet" },
            { label: "Planilla", value: "Planilla" },
            { label: "Otro", value: "Otro" },
        ]
    },
    { key: "numReferencia", label: "N° Referencia", type: "text", required: false },
    { key: "fechaTransaccion", label: "Fecha", type: "date", required: true },
];
//#endregion
