export declare const STATUS: {
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
};
export declare const STATUS_TBL: {
    USER: {
        ACTIVE: number;
        INACTIVE: number;
    };
    Chat_AI: {
        ACTIVE: number;
        INACTIVE: number;
        DELETED: number;
        ARCHIVED: number;
    };
    CLIENT: {
        ACTIVE: number;
        INACTIVE: number;
        DELETED: number;
        PENDING: number;
    };
    BUSINESS: {
        ACTIVE: number;
        DELETED: number;
        INACTIVE: number;
    };
    ACCOUNT_PAYABLE: {
        ACTIVE: number;
        DELETED: number;
        INACTIVE: number;
        PENDING: number;
        PAID: number;
    };
    ORDER_SERVICE: {
        NEW: number;
        IN_PROCESS: number;
        PENDING: number;
        COMPLETED: number;
        DELETED: number;
    };
    ITEMS_ORDER_SERVICE: {
        ACTIVE: number;
        DELETED: number;
        IN_PROCESS: number;
        PENDING: number;
        COMPLETED: number;
    };
    TRANSACTION: {
        ACTIVE: number;
        INACTIVE: number;
        DELETED: number;
        PENDING: number;
        COMPLETED: number;
    };
};
export declare const FILTER_STATUS: {
    ACTIVO: string;
    INACTIVO: string;
    ELIMINADO: string;
    PENDIENTE: string;
    TODOS: string;
    TODOS_SIN_ELIMINADOS: string;
    NUEVO: string;
    EN_PROCESO: string;
    EN_ESPERA: string;
    COMPLETADO: string;
};
export declare const STATUS_ORDEN_SERVICIO_OPTIONS: {
    label: string;
    value: number;
}[];
