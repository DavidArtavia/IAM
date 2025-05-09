export const API_ENDPOINTS = {
    BASE_URL: "https://localhost:44330/api",
    USERS: {
        
        CREATE: "/Usuario/registrarUsuario",
        UPDATE: "/users/update",
    },
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
    },
    PRODUCTS: {
        GET_ALL: "/products",
        GET_BY_ID: "/products/:id",
    },
} as const;