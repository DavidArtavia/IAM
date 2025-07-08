import { DTO_Estado, DTO_Mensaje } from '@/models';
export declare class DTO_ChatIA {
    iD_ChatIA: number;
    iD_Negocio: number;
    estado: DTO_Estado;
    fechaInicial: Date;
    fechaFinal?: Date;
    mensajesChat: DTO_Mensaje[];
}
