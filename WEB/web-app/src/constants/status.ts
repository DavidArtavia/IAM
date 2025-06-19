export const STATUS = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
} as const;

export const STATUS_TBL = {
    USER: {
        ACTIVE: 1,
        INACTIVE: 2,
    },
    CLIENT: {
        ACTIVE: 3, // Para clientes activos en produccion sera id = 3
        INACTIVE: 0,
        DELETED: 4, // Para clientes eliminados en produccion sera id = 4
        PENDING: 0,
    },
    Chat_AI: {
        ACTIVE: 5,
        INACTIVE: 0,
    },
    BUSINESS: {
        ACTIVE: 6,
        DELETED: 7,
        INACTIVE: 0,
    },
    ACCOUNT_PAYABLE: {
        ACTIVE: 8,
        DELETED: 9,
        INACTIVE: 0,
        PENDING: 0,
        PAID: 0,
    },
    ORDER_SERVICE: {
        ACTIVE: 10,
        DELETED: 11,
        IN_PROCESS:0,
        PENDING:0,
        COMPLETED:0,
    },
    ITEMS_ORDER_SERVICE: {
        ACTIVE: 13,
        DELETED: 14, // -> debe ser 12 en produccion
        IN_PROCESS:0,
        PENDING:0,
        COMPLETED:0,
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