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
    PRODUCTS: {
        GET_ALL: "/products",
        GET_BY_ID: "/products/:id",
    },
} as const;