import { DTO_Estado } from "@/models";
export declare class DTO_ItemOrdenServicio {
    iD_ItemOrdenServicio: number;
    iD_OrdenServicio: number;
    estado: DTO_Estado;
    nombreItemOrdenServicio: string;
    descripcion: string;
    monto: number;
    avance?: number;
}
