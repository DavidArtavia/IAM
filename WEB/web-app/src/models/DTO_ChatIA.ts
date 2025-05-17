import { DTO_Estado } from './DTO_Estado';
import { DTO_Mensaje } from './DTO_Mensaje';

export class DTO_ChatIA {
    id_ChatIA: number = 0;
    id_Negocio: number = 0;
    estado: DTO_Estado = new DTO_Estado();
    fechaInicial: Date = new Date();
    fechaFinal?: Date = undefined;
    mensajesChat: DTO_Mensaje[] = [];
}