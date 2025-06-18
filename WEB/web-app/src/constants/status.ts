export const STATUS = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
} as const;

export const STATUS_TBL = {
    USER: {
        ACTIVE: 1,
        INACTIVE: 2,
    },
    BUSINESS: {
        ACTIVE: 4,
        DELETED: 18,
        INACTIVE: 0,
    },
    CLIENT: {
        ACTIVE: 16, // Para clientes activos en produccion sera id = 3
        INACTIVE: 2,
        DELETED: 17, // Para clientes eliminados en produccion sera id = 4
        PENDING: 4,
    },
    ACCOUNT_PAYABLE: {
        ACTIVE: 5,
        DELETED: 7,
        INACTIVE: 0,
        PENDING: 0,
        PAID: 0,
    },
    Chat_AI: {
        ACTIVE: 3,
        INACTIVE: 0,
    },
    ORDER_SERVICE: {
        ACTIVE: 6,
        IN_PROCESS: 7,
        PENDING: 8,
        COMPLETED: 9,
        DELETED: 10,
    }
}

export const FILTER_STATUS = {
    ACTIVO: 'Activo',
    INACTIVO: 'INACTIVO',
    ELIMINADO: 'ELIMINADOS',
    PENDIENTE: 'PENDIENTE',
    TODOS: 'TODOS',
    TODOS_SIN_ELIMINADOS: 'TODOS_SIN_ELIMINADOS',
}