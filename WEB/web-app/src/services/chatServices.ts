import api from "@/api/api";
import { API_ENDPOINTS } from "@/constants/apiEndPoints";
import { DTO_Mensaje } from "@/models/DTO_Mensaje";

export const getBusinessesWithChats = async () => {
    const response = await api.post(API_ENDPOINTS.CHAT.GET_BUSINESS);
    return response.data;
};

export const getMessagesByChat = async () => {
    const response = await api.post(API_ENDPOINTS.CHAT.GET_MESSAGES);
    return response.data;
};

export const sendTextMessage = async (values: DTO_Mensaje) => {
    const response = await api.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, values);
    return response.data;
};

export const sendAudioMessage = async (values: DTO_Mensaje) => {
    const formData = new FormData();

    // Convertir el DTO a FormData
    Object.keys(values).forEach(key => {
        const value = values[key as keyof DTO_Mensaje];

        if (value !== undefined && value !== null) {
            if (key === 'audio' && value instanceof File) {
                formData.append('audio', value, 'audio.wav');
            } else if (value instanceof Date) {
                formData.append(key, value.toISOString());
            } else {
                formData.append(key, value.toString());
            }
        }
    });

    const response = await api.post(
        API_ENDPOINTS.CHAT.SEND_MESSAGE,
        formData,
        {
            withCredentials: true,
            headers: {
                'Content-Type': undefined // Dejo que el navegador lo maneje
            }
        }
    );
    return response.data;
};