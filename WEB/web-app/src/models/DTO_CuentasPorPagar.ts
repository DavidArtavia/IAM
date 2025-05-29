import { DTO_Estado } from './DTO_Estado';

export class DTO_CuentasPorPagar {
    iD_CuentasPorPagar: number | null = null;
    iD_Negocio: number | null = null;
    estado: DTO_Estado | null = null;
    concepto: string | null = null;
    descripcion: string | null = null;
    saldo: number | null = null;
    fechaInicial: Date | null = null;
    fechaModificacion: Date | null = null;
}