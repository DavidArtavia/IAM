import { Observable, defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import { DTO_Respuesta, DTO_Negocio, DTO_ChatIA, DTO_Mensaje } from '@/models';
import { AxiosResponse } from 'axios';

export class chatService {

  static obtenerNegocios(): Observable<DTO_Respuesta> {
    return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.BUSINESS.GET_BUSINESS)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
  }

  static obtenerChatsPorNegocio(negocio: DTO_Negocio): Observable<DTO_Respuesta> {
    return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.CHAT.GET_CHATS, negocio)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
  }

  static obtenerMensajesPorChat(chat: DTO_ChatIA): Observable<DTO_Respuesta> {
    return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.CHAT.GET_MESSAGES, chat)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
  }
  static enviarMensajeTexto(mensaje: DTO_Mensaje): Observable<DTO_Respuesta> {
    return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.CHAT.SEND_MESSAGE, mensaje)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
  }

  static enviarMensajeAudio(mensaje: DTO_Mensaje): Observable<DTO_Respuesta> {

    const formData = new FormData();
    formData.append('iD_ChatIA', mensaje.iD_ChatIA.toString());
    formData.append('tipo', mensaje.tipo);
    formData.append('textoMensaje', mensaje.textoMensaje);
    formData.append('audio', mensaje.audio!);

    return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.CHAT.SEND_MESSAGE, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
  }
}
