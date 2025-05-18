export class DTO_Mensaje {
    iD_Mensaje: number = 0;
    iD_ChatIA: number = 0;
    tipo: string = '';
    textoMensaje: string = '';
    transcripcionAudio: string = '';
    rutaAudio: string = '';
    fechaMensaje: Date = new Date();
    audio?: File;
    fromUser: boolean = false;
}