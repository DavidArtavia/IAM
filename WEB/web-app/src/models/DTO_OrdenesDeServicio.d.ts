import { DTO_Estado, DTO_Param } from "@/models";
export declare class DTO_OrdenServicio {
    iD_OrdenServicio: number;
    iD_Cliente: number;
    iD_Negocio: number;
    estado: DTO_Estado;
    fechaOrdenServicio: Date | null;
    fechaEstimadaEntrega: Date | null;
    fechaInicio: Date | null;
    fechaFinal: Date | null;
    fechaEntrega: Date | null;
    notaOrdenServicio: string;
    referenciaJSON: Array<DTO_Param>;
}
