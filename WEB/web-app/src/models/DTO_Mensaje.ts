export class DTO_Mensaje {
    ID_Mensaje: number = 0;
    ID_ChatIA: number = 0;
    Tipo: string = '';
    TextoMensaje: string = '';
    TranscripcionAudio: string = '';
    RutaAudio: string = '';
    FechaMensaje: Date = new Date();
    audio?: File;
    fromUser: boolean = false;
}