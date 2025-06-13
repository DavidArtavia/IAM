import { DTO_Estado, DTO_Param } from "@/models";

export class DTO_OrdenServicio {
    iD_OrdenServicio: number = 0;
    iD_Cliente: number = 0;
    iD_Negocio: number = 0;
    estado: DTO_Estado = new DTO_Estado();
    fechaOrdenServicio: Date | null = null;
    fechaEstimadaEntrega: Date | null = null;
    fechaInicio: Date | null = null;
    fechaFinal: Date | null = null;
    fechaEntrega: Date | null = null;
    notaOrdenServicio: string = '';
    referenciaJSON: Array<DTO_Param> = [];
}