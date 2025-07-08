import { DTO_Estado } from "./DTO_Estado";
export declare class DTO_Transacciones {
    iD_Transaccion: number;
    iD_Negocio: number;
    estado: DTO_Estado;
    concepto: string;
    monto: number;
    tipo: string;
    numReferencia: string;
    tipoNumReferencia: string;
    fechaTransaccion: Date;
}
