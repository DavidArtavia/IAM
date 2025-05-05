export const ROUTES = {
    HOME: "/home",
    ABOUT: "/about",
    STATISTICS: "/statistics",
    CONTACT: "/contact",
    SERVICES: "/services",
    BLOG: "/blog",
    LOGIN: "/login",
    REGISTER: "/register",
    PROFILE: "/profile",
    DASHBOARD: "/dashboard",
    SETTINGS: "/settings",
    HELP: "/help",
    TERMS: "/terms",
    PRIVACY: "/privacy",
    NOT_FOUND: "*", // Ruta para manejar páginas no encontradas
} as const;

// Tipo para las claves de las rutas
export type RouteKeys = keyof typeof ROUTES;

// Tipo para los valores de las rutas
export type RouteValues = (typeof ROUTES)[RouteKeys];
