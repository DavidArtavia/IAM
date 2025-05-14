export const API_ENDPOINTS = {
    BASE_URL: "https://localhost:44330/api",
    USERS: {
        
        CREATE: "/Usuario/registrarUsuario",
        UPDATE: "/users/update",
    },
    AUTH: {
        LOGIN: "/Usuario/autenticarUsuario",
        LOGOUT: "/auth/logout",
        FORGOT_PASSWORD: "/auth/forgot-password",
    },
    CHAT: {
        GET_BUSINESS: "/ChatIA/obtenerNegociosConChat",
        GET_MESSAGES: "/ChatIA/obtenerMensajes",
        SEND_MESSAGE: "/ChatIA/enviarMensaje",
    },
} as const;