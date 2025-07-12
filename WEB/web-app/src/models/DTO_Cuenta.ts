import { DTO_Estado } from './DTO_Estado';

export interface DetalleCuentaJSON {
    Filas: { Nombre: string; Valor: string }[];
    Descuento: { Tipo: "Monto" | "Porcentaje"; Valor: string };
    Impuesto: number;
}

export class DTO_Cuenta {
    iD_Cuenta: number = 0;
    iD_Negocio: number = 0;
    iD_OrdenServicio?: number;
    estado: DTO_Estado = new DTO_Estado();
    concepto: string = "";
    descripcion?: string;
    monto: number = 0;
    tipoCuenta: string = "";
    detalleJSON?: DetalleCuentaJSON;
    fechaInicial: Date = new Date();
    fechaModificacion: Date = new Date();
    fechaLimite: Date = new Date();
}