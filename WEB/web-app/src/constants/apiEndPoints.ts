export const API_ENDPOINTS = {
    BASE_URL: "http://localhost:3002/api",
    USERS: {
        CREATE: "/users/create",
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