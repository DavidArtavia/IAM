import { defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
export class chatService {
    static crearChat(negocio) {
        return defer(() => api.post(API_ENDPOINTS.CHAT.CREATE_CHAT, negocio)).pipe(map((r) => r.data));
    }
    static obtenerChatsPorNegocio(negocio) {
        return defer(() => api.post(API_ENDPOINTS.CHAT.GET_CHATS, negocio)).pipe(map((r) => r.data));
    }
    static obtenerMensajesPorChat(chat) {
        return defer(() => api.post(API_ENDPOINTS.CHAT.GET_MESSAGES, chat)).pipe(map((r) => r.data));
    }
    static enviarMensajeTexto(mensaje) {
        const formData = new FormData();
        formData.append('iD_ChatIA', mensaje.iD_ChatIA.toString());
        formData.append('envia', mensaje.envia);
        formData.append('contenido', mensaje.contenido);
        formData.append('recibe', mensaje.recibe);
        return defer(() => api.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).pipe(map((r) => r.data));
    }
    static enviarMensajeAudio(mensaje) {
        const formData = new FormData();
        formData.append('iD_ChatIA', mensaje.iD_ChatIA.toString());
        formData.append('contenido', mensaje.contenido);
        formData.append('audio', mensaje.audio);
        formData.append('recibe', mensaje.recibe);
        return defer(() => api.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).pipe(map((r) => r.data));
    }
}
