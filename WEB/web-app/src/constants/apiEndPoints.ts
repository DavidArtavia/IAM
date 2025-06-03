export const API_ENDPOINTS = {
    BASE_URL: "https://localhost:44330/api",
    USERS: {
        
        CREATE:    "/Usuario/registrarUsuario",
        UPDATE:    "",
        GET_BY_ID: "/Usuario/obtenerUsuarioPorId",
    },
    AUTH: {
        LOGIN:           "/Usuario/autenticarUsuario",
        LOGOUT:          "/auth/logout",
        FORGOT_PASSWORD: "/auth/forgot-password",
        CHANGE_PASSWORD: "/Usuario/cambiarContrasena",
    },
    BUSINESS: {
        GET_BUSINESS: "/Negocio/obtenerNegocios",
    },
    CHAT: {
        GET_CHATS:     "/ChatIA/obtenerChats",
        GET_MESSAGES: "/ChatIA/obtenerMensajes",
        SEND_MESSAGE: "/ChatIA/enviarMensaje",
    },
    ACCOUNTS_PAYABLE: {
        GET_ACCOUNTS: "/Cuenta/obtenerCuentas",
        ADD_ACCOUNT: "/Cuenta/registrarCuenta",
        UPDATE_ACCOUNT: "/Cuenta/actualizarCuentas",
        DELETE_ACCOUNT: "/Cuenta/eliminarCuenta",
    },
} as const;