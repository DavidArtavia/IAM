import { DTO_Estado } from "@/models";

export class DTO_ItemOrdenServicio {
    ID_ItemOrdenServicio: number = 0;
    ID_OrdenServicio: number = 0;
    Estado: DTO_Estado = new DTO_Estado();
    NombreItemOrdenServicio: string = '';
    Descripcion: string = '';
    Monto: number = 0;
    Avance?: number = 0;
}
