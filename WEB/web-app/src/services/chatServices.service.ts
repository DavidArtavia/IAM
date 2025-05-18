import api from "@/api/api";
import { API_ENDPOINTS } from "@/constants/apiEndPoints";
import { DTO_ChatIA } from "@/models/DTO_ChatIA";
import { DTO_Mensaje } from "@/models/DTO_Mensaje";
import { DTO_Negocio } from "@/models/DTO_Negocio";
import { DTO_Respuesta } from "@/models/DTO_Respuesta";

export const getBusinesses = async (): Promise<DTO_Negocio[] | string> => {
    const response = await api.post<DTO_Respuesta>(API_ENDPOINTS.BUSINESS.GET_BUSINESS);
    if (!response.data.tipoRespuesta) return response.data.mensaje;
    const raw = response.data.resultado;
    // Si el primer elemento es un array, devuelve ese array
    if (Array.isArray(raw[0])) {
        return raw[0] as DTO_Negocio[];
    }
    // Si no, devuelve resultado normal
    return raw as DTO_Negocio[];
};

export const getChatsByBusiness = async (
    negocio: DTO_Negocio
): Promise<DTO_ChatIA[] | string> => {
    const response = await api.post<DTO_Respuesta>(API_ENDPOINTS.CHAT.GET_CHATS, negocio);
    if (!response.data.tipoRespuesta) return response.data.mensaje;
    const raw = response.data.resultado;
    // Si el primer elemento es a su vez un array, lo desenrollamos:
    if (Array.isArray(raw[0])) {
        return raw[0] as DTO_ChatIA[];
    }
    return raw as DTO_ChatIA[];
};

export const getMessagesByChat = async (chat: DTO_ChatIA): Promise<DTO_Mensaje[] | string> => {
    const response = await api.post<DTO_Respuesta>(API_ENDPOINTS.CHAT.GET_MESSAGES, chat);
    console.log('la respuesta de getMessagesByChat es1:', response.data);

    if (!response.data.tipoRespuesta) return response.data.mensaje;
    return response.data.resultado as DTO_Mensaje[];
};

export const sendTextMessage = async (mensaje: DTO_Mensaje): Promise<DTO_Mensaje | string> => {
    const response = await api.post<DTO_Respuesta>(API_ENDPOINTS.CHAT.SEND_MESSAGE, mensaje);
    if (!response.data.tipoRespuesta) return response.data.mensaje;
    return response.data.resultado[0] as DTO_Mensaje; // <<-TODO hay que ver que devuelve el backend caundo enviamos mensajes
};

export const sendAudioMessage = async (mensaje: DTO_Mensaje): Promise<DTO_Mensaje | string> => {
    const formData = new FormData();
    formData.append("iD_ChatIA", mensaje.iD_ChatIA.toString());
    formData.append("tipo", mensaje.tipo);
    formData.append("textoMensaje", mensaje.textoMensaje);
    formData.append("audio", mensaje.audio!); // debe ser un File WAV 

    const response = await api.post<DTO_Respuesta>(API_ENDPOINTS.CHAT.SEND_MESSAGE, formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    if (!response.data.tipoRespuesta) return response.data.mensaje;
    return response.data.resultado[0] as DTO_Mensaje; // hay que ver que devuelve el backend caundo enviamos mensajes
};