import { DTO_Estado, DTO_Mensaje } from '@/models';

export class DTO_ChatIA {
    iD_ChatIA: number = 0;
    iD_Negocio: number = 0;
    estado: DTO_Estado = new DTO_Estado();
    fechaInicial: Date = new Date();
    fechaFinal?: Date = undefined;
    mensajesChat: DTO_Mensaje[] = [];
}