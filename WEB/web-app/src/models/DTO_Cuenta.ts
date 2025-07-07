import { DTO_Estado } from './DTO_Estado';
import { DTO_Param } from './DTO_Param';

export class DTO_Cuenta {
    iD_Cuenta: number = 0;
    iD_Negocio: number = 0;
    iD_OrdenServicio?: number;
    estado: DTO_Estado = new DTO_Estado();
    concepto: string = "";
    descripcion?: string;
    monto: number = 0;
    tipoCuenta: string = "";
    detalleJSON?: Array<DTO_Param> = [];
    fechaInicial: Date = new Date();
    fechaModificacion: Date = new Date();
    fechaLimite: Date = new Date();
}