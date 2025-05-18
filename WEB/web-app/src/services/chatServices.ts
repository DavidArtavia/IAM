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

export const getMessagesByChat = async (
    chat: DTO_ChatIA
): Promise<DTO_Mensaje[] | string> => {
    const response = await api.post<DTO_Respuesta>(
        API_ENDPOINTS.CHAT.GET_MESSAGES,
        chat
    );
    if (!response.data.tipoRespuesta) {
        return response.data.mensaje;
    }

    // 1) Extraemos el resultado y desenrollamos un posible array anidado
    let rawResult = response.data.resultado;
    if (Array.isArray(rawResult[0])) {
        rawResult = rawResult[0] as object[];
    }

    // 2) Convertimos cada objeto en un DTO_Mensaje bien tipado
    const messages: DTO_Mensaje[] = rawResult.map((item) => {
        // item es un object con propiedades de la API
        const o = item as Record<string, unknown>;
        const msg = new DTO_Mensaje();

        msg.iD_Mensaje = typeof o.iD_Mensaje === "number" ? o.iD_Mensaje : Number(o.iD_Mensaje);
        msg.iD_ChatIA = typeof o.iD_ChatIA === "number" ? o.iD_ChatIA : Number(o.iD_ChatIA);
        msg.tipo = typeof o.tipo === "string" ? o.tipo : String(o.tipo); // "user" o "assistant"
        msg.textoMensaje = typeof o.textoMensaje === "string" ? o.textoMensaje : "";
        msg.transcripcionAudio = typeof o.transcripcionAudio === "string" ? o.transcripcionAudio : "";
        msg.rutaAudio = typeof o.rutaAudio === "string" ? o.rutaAudio : "";
        msg.fechaMensaje = o.fechaMensaje ? new Date(String(o.fechaMensaje)) : new Date();
        msg.audio = undefined;          // sólo se usa al grabar en cliente
        msg.fromUser = o.tipo === "user";  // true si es usuario, false si "assistant"

        // Aquí extraemos SOLO RespuestaUsuario si viene en JSON al final
        let text = typeof o.textoMensaje === "string" ? o.textoMensaje : "";
        // Busca la última llave '{' para tomar JSON
        const idx = text.lastIndexOf("{");
        if (idx !== -1) {
            const maybeJson = text.substring(idx);
            try {
                const parsed = JSON.parse(maybeJson);
                if (parsed.RespuestaUsuario) {
                    text = parsed.RespuestaUsuario;
                }
            } catch {
                // no hacemos nada si falla
            }
        }
        msg.textoMensaje = text.trim();
        return msg;
    });

    return messages;
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