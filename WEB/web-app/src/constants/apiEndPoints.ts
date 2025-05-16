export const API_ENDPOINTS = {
    BASE_URL: "https://localhost:44330/api",
    USERS: {
        
        CREATE: "/Usuario/registrarUsuario",
        UPDATE: "",
        GET_BY_ID: '/Usuario/obtenerUsuarioPorId',
    },
    AUTH: {
        LOGIN: "/Usuario/autenticarUsuario",
        LOGOUT: "/auth/logout",
        FORGOT_PASSWORD: "/auth/forgot-password",
        CHANGE_PASSWORD: "/Usuario/cambiarContrasena",
    },
    CHAT: {
        GET_BUSINESS: "/ChatIA/obtenerNegocios",
        GET_MESSAGES: "/ChatIA/obtenerMensajes",
        GET_CHAT: "/ChatIA/obtenerChats",
        SEND_MESSAGE: "/ChatIA/enviarMensaje",
    },
} as const;