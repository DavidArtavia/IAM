import { DTO_Estado } from './DTO_Estado';

export class DTO_CuentasPorPagar {
    iD_CuentasPorPagar: number = 0;
    iD_Negocio: number = 0;
    estado: DTO_Estado = new DTO_Estado();
    concepto: string = "";
    descripcion: string = "";
    saldo: number = 0;
    fechaInicial: Date = new Date();
    fechaModificacion: Date = new Date();
}