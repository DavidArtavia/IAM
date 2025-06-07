export class DTO_Mensaje {
    iD_Mensaje: number = 0;
    iD_ChatIA: number = 0;
    envia: string = '';
    recibe: string = '';
    contenido: string = '';
    parametros: Array<string> = [];
    rutaAudio: string = '';
    fechaMensaje: Date = new Date();
    audio?: File;
}