import { Observable } from 'rxjs';
import { DTO_Respuesta, DTO_Negocio, DTO_ChatIA, DTO_Mensaje } from '@/models';
export declare class chatService {
    static crearChat(negocio: DTO_Negocio): Observable<DTO_Respuesta>;
    static obtenerChatsPorNegocio(negocio: DTO_Negocio): Observable<DTO_Respuesta>;
    static obtenerMensajesPorChat(chat: DTO_ChatIA): Observable<DTO_Respuesta>;
    static enviarMensajeTexto(mensaje: DTO_Mensaje): Observable<DTO_Respuesta>;
    static enviarMensajeAudio(mensaje: DTO_Mensaje): Observable<DTO_Respuesta>;
}
