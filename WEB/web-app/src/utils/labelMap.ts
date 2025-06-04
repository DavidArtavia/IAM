import { FieldConfig } from "@/components/Modals/GenericFormModal/types";
import { DTO_CuentasPorPagar, DTO_Negocio } from "@/models";

export const labelCuentasPorPagar: Record<string, string> = {
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
    "referenciaJSON.Placa": "Placa",
    "referenciaJSON.Marca": "Marca",
};
export const negocioFormFields: Array<FieldConfig<DTO_Negocio>> = [
    {
        key: "nombreNegocio",
        label: labelMapNegocio.nombreNegocio,
        type: "text",
    },
    {
        key: "descripcion",
        label: labelMapNegocio.descripcion,
        type: "text",
    },
    {
        key: "direccion",
        label: labelMapNegocio.direccion,
        type: "text",
    },
    {
        key: "telefonoNegocio",
        label: labelMapNegocio.telefonoNegocio,
        type: "text",
    },
    {
        // este campo es opcional, puede que no se le permta al usuario cambiarlo 
        key: "correoNegocio",
        label: labelMapNegocio.correoNegocio,
        type: "text",
    },
];
export const cuentasFormFields: Array<FieldConfig<DTO_CuentasPorPagar>> = [

    {
        key: "concepto",
        label: labelCuentasPorPagar.concepto,
        type: "text"
    },

    { 
        key: "descripcion",
        label: labelCuentasPorPagar.descripcion,
        type: "text"
    },

    { 
        key: "saldo",
        label: labelCuentasPorPagar.saldo,
        type: "number"
    },

];
