export declare class DTO_Mensaje {
    iD_Mensaje: number;
    iD_ChatIA: number;
    envia: string;
    recibe: string;
    contenido: string;
    parametros: Array<string>;
    rutaAudio: string;
    fechaMensaje: Date;
    audio?: File;
}
