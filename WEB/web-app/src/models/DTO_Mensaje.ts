export class DTO_Mensaje {
    id_Mensaje: number = 0;
    id_ChatIA: number = 0;
    tipo: string = '';
    textoMensaje: string = '';
    transcripcionAudio: string = '';
    rutaAudio: string = '';
    fechaMensaje: Date = new Date();
    audio?: File;
    fromUser: boolean = false;
}