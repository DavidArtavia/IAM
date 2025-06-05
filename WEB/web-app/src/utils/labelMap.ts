import { FieldConfig } from "@/components/Modals/GenericFormModal/types";
import { DTO_CuentasPorPagar, DTO_Negocio } from "@/models";

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
    "iD_Usuario",
    "nombreNegocio",
    "descripcion",
    "direccion",
    "telefonoNegocio",
    "correoNegocio",
    "fechaRegistro",
    // "referenciaJSON.Placa",
    // "referenciaJSON.Marca",
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
    iD_Usuario: "Usuario #",
    estado: "Estado",
    nombreNegocio: "Nombre del Negocio",
    descripcion: "Descripción",
    direccion: "Dirección",
    telefonoNegocio: "Teléfono del Negocio",
    correoNegocio: "Correo del Negocio",
    fechaRegistro: "Fecha de Registro",
    referenciaJSON: "Referencias",
    //    "referenciaJSON.Valor": "Valor",
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
