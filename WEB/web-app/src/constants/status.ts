export const STATUS = {
    UNAUTHORIZED : 401,
    FORBIDDEN : 403,
} as const;

export const STATUS_TBL = {
    USER: {
        ACTIVE: 1,
        INACTIVE: 2,
    },
    BUSINESS: {
        ACTIVE: 4,
        DELETED: 1009,
        INACTIVE: 0,
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
        INACTIVE: 2,
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