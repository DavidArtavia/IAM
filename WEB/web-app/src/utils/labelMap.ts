import { FieldConfig } from "@/components/Modals/GenericFormModal/types";
import { DTO_CuentasPorPagar, DTO_Negocio, DTO_OrdenServicio } from "@/models";

//  Define configuraciones de campos de formulario (FieldConfig) para construir formularios dinámicos relacionados con estos modelos.
// Los label maps permiten mostrar nombres amigables en la UI, y los arreglos de campos de formulario se usan para generar formularios de manera flexible.
export const columnKeysCuentasPorPagar: (keyof DTO_CuentasPorPagar)[] = [
    "iD_CuentasPorPagar",
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
    "iD_Negocio",
    "fechaEstimadaEntrega",
    "fechaInicio",
    "fechaFinal",
    "fechaEntrega",
    // "referenciaJSON",
    "notaOrdenServicio"
];

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
    iD_Negocio: "Negocio #",
    fechaInicio: "Fecha de Inicio",
    fechaEstimadaEntrega: "Fecha Estimada de Entrega",
    fechaFinal: "Fecha Final",
    fechaEntrega: "Fecha de Entrega",
    notaOrdenServicio: "Nota",
    referenciaJSON: "Referencias"
};

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

export const ordenServicioFormEditFields: Array<
    FieldConfig<DTO_OrdenServicio>
> = [
        // Campo fechaInicio fijo
        {
            key: "fechaInicio",
            label: labelMapOrdenDeServicio["fechaInicio"] ?? "fechaInicio",
            type: "date", // aquí TS sabe que es literal "date"
        },
        // Resto de campos automáticos
        ...columnKeysOrdenDeServicio
            .filter(
                (key) =>
                    key !== "iD_Negocio" &&
                    key !== "fechaEntrega" &&
                    key !== "fechaInicio" &&
                    key !== "referenciaJSON" &&
                    key !== "fechaFinal"
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
