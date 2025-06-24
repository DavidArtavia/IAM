export const STATUS = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
} as const;

export const STATUS_TBL = {
    USER: {
        ACTIVE: 1,
        INACTIVE: 2,
    },
    Chat_AI: {
        ACTIVE: 3,
        INACTIVE: 0,
        DELETED: 13,
        ARCHIVED: 15,
    },
    CLIENT: {
        ACTIVE: 16,
        INACTIVE: 0,
        DELETED: 17,
        PENDING: 0,
    },
    BUSINESS: {
        ACTIVE: 4,
        DELETED: 11,
        INACTIVE: 0,
    },
    ACCOUNT_PAYABLE: {
        ACTIVE: 5,
        DELETED: 14,
        INACTIVE: 0,
        PENDING: 0,
        PAID: 0,
    },
    ORDER_SERVICE: {
        NEW: 6,
        IN_PROCESS: 7,
        PENDING: 8,
        COMPLETED: 9,
        DELETED: 10,
    },
    ITEMS_ORDER_SERVICE: {
        ACTIVE: 18,
        DELETED: 19,
        IN_PROCESS: 0,
        PENDING: 0,
        COMPLETED: 0,
    }
}

export const FILTER_STATUS = {
    ACTIVO: 'Activo',
    INACTIVO: 'Inactivo',
    ELIMINADO: 'Eliminado',
    PENDIENTE: 'Pendiente',
    TODOS: 'Todos',
    TODOS_SIN_ELIMINADOS: 'Todos_sin_eliminados',
}


export const STATUS_ORDEN_SERVICIO_OPTIONS = [
    { label: 'Nuevo', value: STATUS_TBL.ORDER_SERVICE.NEW},
    { label: 'En Proceso', value: STATUS_TBL.ORDER_SERVICE.IN_PROCESS},
    { label: 'En Espera', value: STATUS_TBL.ORDER_SERVICE.PENDING },
    { label: 'Completado', value: STATUS_TBL.ORDER_SERVICE.COMPLETED },
];