export const ROUTES = {
    HOME: "/home",
    ABOUT: "/about",
    STATISTICS: "/statistics",
    CHAT_AI: "/chat",
    CONTACT: "/contact",
    SERVICES: "/services",
    BLOG: "/blog",
    LOGIN: "/login",
    SIGNUP: "/sign-up",
    REGISTER: "/register",
    PROFILE: "/profile",
    DASHBOARD: "/dashboard",
    SETTINGS: "/settings",
    HELP: "/help",
    TERMS: "/terms",
    PRIVACY: "/privacy",
    NEGOCIO: "/negocio",
    MONITOR: "/monitor",
    CUENTAS: "/cuentas",
    CLIENTES: "/clientes",
    TRANSACTIONS: "/transactions",
    SERVICE_ORDER: "/orden-servicio", 
    INFO: "/info",
    RATE: "/rates", // Tarifario
    NOT_FOUND: "*", 
} as const;

// Tipo para las claves de las rutas
export type RouteKeys = keyof typeof ROUTES;

// Tipo para los valores de las rutas
export type RouteValues = (typeof ROUTES)[RouteKeys];
