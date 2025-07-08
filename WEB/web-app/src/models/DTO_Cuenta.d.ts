import { DTO_Estado } from './DTO_Estado';
import { DTO_Param } from './DTO_Param';
export declare class DTO_Cuenta {
    iD_Cuenta: number;
    iD_Negocio: number;
    iD_OrdenServicio?: number;
    estado: DTO_Estado;
    concepto: string;
    descripcion?: string;
    monto: number;
    tipoCuenta: string;
    detalleJSON?: Array<DTO_Param>;
    fechaInicial: Date;
    fechaModificacion: Date;
    fechaLimite: Date;
}
