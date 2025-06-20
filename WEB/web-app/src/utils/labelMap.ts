import { FieldConfig } from "@/components/Modals/GenericFormModal/types";
import { DTO_Cliente, DTO_CuentasPorPagar, DTO_Negocio, DTO_OrdenServicio } from "@/models";

//#region columnas de tablas

//  Define configuraciones de campos de formulario (FieldConfig) para construir formularios dinámicos relacionados con estos modelos.
// Los label maps permiten mostrar nombres amigables en la UI, y los arreglos de campos de formulario se usan para generar formularios de manera flexible.
export const columnKeysCuentasPorPagar: (keyof DTO_CuentasPorPagar)[] = [
    // "iD_CuentasPorPagar",
    "iD_Negocio",
    "concepto",
    "descripcion",
    "saldo",
    "fechaInicial",
    "fechaModificacion",
];
export const columnKeysNegocio: (keyof DTO_Negocio)[] = [
    "iD_Negocio",
    "nombreNegocio",
    "descripcion",
    "direccion",
    "telefonoNegocio",
    "correoNegocio",
    "fechaRegistro"
];
export const columnKeysOrdenDeServicio: (keyof DTO_OrdenServicio)[] = [
    "iD_OrdenServicio",
    "fechaOrdenServicio",
    "fechaEstimadaEntrega",
    "notaOrdenServicio"
];

export const columnKeysCliente: (keyof DTO_Cliente)[] = [
    "iD_Cliente",
    "nombreCliente",
    "apellidoCliente",
    "telefonoCliente",
    "correoCliente",
];

export const columnKeysItemsOrdenServicio: string[] = [
    "iD_ItemOrdenServicio",
    "iD_OrdenServicio",
    "nombreItemOrdenServicio",
    "descripcion",
    "monto",
    "avance",
];

//#endregion

//#region modal para visualizar detalles de objetos

// Define los atributos que se mostrarán en el infoModal de las filas de las tablas de los modelos.
export const keysInfoModalOrdenDeServicio: (keyof DTO_OrdenServicio)[] = [

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
export const keysInfoModalNegocio: (keyof DTO_Negocio)[] = [

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

export const keysInfoModalCuentasPorPagar: (keyof DTO_CuentasPorPagar)[] = [
    // "iD_CuentasPorPagar",
    "iD_Negocio",
    "concepto",
    "descripcion",
    "saldo",
    "fechaInicial",
    "fechaModificacion",
    "estado",
];

export const keysInfoModalCliente: (keyof DTO_Cliente)[] = [
    "iD_Cliente",
    "nombreCliente",
    "apellidoCliente",
    "telefonoCliente",
    "correoCliente",
    "estado",
];
export const keysInfoModalItemsOrdenServicio: string[] = [
    "iD_ItemOrdenServicio",
    "iD_OrdenServicio",
    "nombreItemOrdenServicio",
    "descripcion",
    "monto",
    "avance",
    "estado",
];

//#endregion

//#region tablas

// Este archivo define mapas de etiquetas (label maps) para mostrar nombres legibles en los titulos del DataTable de los modelos.
export const labelMapCuentasPorPagar: Record<string, string> = {
    iD_CuentasPorPagar: "Cuenta por Pagar #",
    iD_Negocio: "Negocio #",
    concepto: "Concepto",
    descripcion: "Descripción",
    saldo: "Saldo",
    fechaInicial: "Fecha Inicial",
    fechaModificacion: "Fecha Modificación",
    estado: "Estado",
    iD_Estado: "ID Estado",
    nombre: "Nombre",
    tabla: "Tabla",
};

export const labelMapNegocio: Record<string, string> = {
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

export const labelMapOrdenDeServicio: Record<string, string> = {
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

export const labelMapCliente: Record<string, string> = {
    iD_Cliente: "Cliente #",
    nombreCliente: "Nombre",
    apellidoCliente: "Apellido(s)",
    telefonoCliente: "Teléfono",
    correoCliente: "Correo",
    estado: "Estado",
};

export const labelMapItemsOrdenServicio: Record<string, string> = {
    iD_ItemOrdenServicio: "Item #",
    iD_OrdenServicio: "Orden Servicio #",
    nombreItemOrdenServicio: "Nombre del Item",
    descripcion: "Descripción",
    monto: "Monto",
    avance: "Avance",
    estado: "Estado",
};

//#endregion

//#region campos a mostrar para el form de editar

// Exportación de los campos del formulario editar para los modelos
export const negocioFormEditFields: Array<FieldConfig<DTO_Negocio>> = columnKeysNegocio
    .filter(key => key !== "iD_Negocio" && key !== "iD_Usuario" && key !== "fechaRegistro") // Excluye campos que no se editan
    .map(key => ({
        key,
        label: labelMapNegocio[key] ?? key,
        type: "text",
    }));

export const cuentasFormEditFields: Array<FieldConfig<DTO_CuentasPorPagar>> = columnKeysCuentasPorPagar
    .filter(key => key !== "iD_CuentasPorPagar" && key !== "iD_Negocio" && key !== "fechaInicial" && key !== "fechaModificacion") // Excluye campos que no se editan
    .map(key => ({
        key,
        label: labelMapCuentasPorPagar[key] ?? key,
        type: key === "saldo" ? "number" : "text",
    }));

export const clienteFormEditFields: Array<FieldConfig<DTO_Cliente>> = columnKeysCliente
    .filter(key => key !== "iD_Cliente" && key !== "iD_Usuario") // Excluye campos que no se editan
    .map(key => ({
        key,
        label: labelMapCliente[key] ?? key,
        type: "text",
    }));
export const ItemsOrdenServicioFormEditFields: Array<FieldConfig<any>> = columnKeysItemsOrdenServicio
    .filter(key => key !== "iD_ItemOrdenServicio" && key !== "iD_OrdenServicio") // Excluye campos que no se editan
    .map(key => ({
        key,
        label: labelMapItemsOrdenServicio[key] ?? key,
        type: key === "monto" || key === "avance" ? "number" : "text",
    }));

export const ordenServicioFormEditFields: Array<
    FieldConfig<DTO_OrdenServicio>
> = [
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
            .filter(
                (key) =>
                    key !== "referenciaJSON" &&
                    key !== "fechaOrdenServicio" &&
                    key !== "iD_OrdenServicio" // Excluimos el ID de la orden de servicio
            )
            .map((key) => {
                // convertimos el resultado a un literal
                const fieldType = key.toString().includes("fecha")
                    ? ("date" as const)
                    : ("text" as const);

                const config: FieldConfig<DTO_OrdenServicio> = {
                    key,
                    label: labelMapOrdenDeServicio[key as keyof typeof labelMapOrdenDeServicio] ?? String(key),
                    type: fieldType, // TS ve aquí un "date" | "text" válido
                };

                return config;
            }),
    ];
//#endregion


