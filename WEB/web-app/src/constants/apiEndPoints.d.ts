export declare const API_ENDPOINTS: {
    readonly BASE_URL: "https://localhost:44330/api";
    readonly USERS: {
        readonly CREATE: "/Usuario/registrarUsuario";
        readonly UPDATE: "";
        readonly GET_BY_ID: "/Usuario/obtenerUsuarioPorId";
    };
    readonly AUTH: {
        readonly LOGIN: "/Usuario/autenticarUsuario";
        readonly LOGOUT: "/auth/logout";
        readonly FORGOT_PASSWORD: "/auth/forgot-password";
        readonly CHANGE_PASSWORD: "/Usuario/cambiarContrasena";
    };
    readonly BUSINESS: {
        readonly GET_BUSINESS: "/Negocio/obtenerNegocios";
        readonly ADD_BUSINESS: "/Negocio/registrarNegocio";
        readonly UPDATE_BUSINESS: "/Negocio/actualizarNegocio";
    };
    readonly CHAT: {
        readonly GET_CHATS: "/ChatIA/obtenerChats";
        readonly GET_MESSAGES: "/ChatIA/obtenerMensajes";
        readonly SEND_MESSAGE: "/ChatIA/enviarMensaje";
        readonly CREATE_CHAT: "/ChatIA/crearChat";
    };
    readonly ACCOUNTS_PAYABLE: {
        readonly GET_ACCOUNTS: "/Cuenta/obtenerCuentas";
        readonly ADD_ACCOUNT: "/Cuenta/registrarCuenta";
        readonly UPDATE_ACCOUNT: "/Cuenta/actualizarCuentas";
    };
    readonly ORDERS: {
        readonly GET_ORDERS: "/OrdenServicio/obtenerOrdenDeServicio";
        readonly ADD_ORDER: "/OrdenServicio/registrarOrdenServicio";
        readonly UPDATE_ORDER: "/OrdenServicio/actualizarOrdenServicio";
    };
    readonly ITEMS_ORDERS: {
        readonly GET_ORDERS: "/ItemOrdenServicio/obtenerItemOrdenServicio";
        readonly ADD_ORDER: "/ItemOrdenServicio/guardarItemOrdenServicio";
        readonly UPDATE_ORDER: "/ItemOrdenServicio/actualizarItemOrdenServicio";
    };
    readonly CLIENTS: {
        readonly GET_CLIENTS: "/Cliente/obtenerClientes";
        readonly SEARCH_CLIENTS: "/Cliente/buscarClientes";
        readonly ADD_CLIENT: "/Cliente/guardarCliente";
        readonly UPDATE_CLIENT: "/Cliente/actualizarCliente";
    };
    readonly MONITOR: {
        readonly GET_MONITOR_OS: "/Monitor/cargarMonitorOrdenServicio";
    };
    readonly TRANSACTIONS: {
        readonly ADD_TRANSACTION: "/Transacciones/registrarTransaccion";
        readonly GET_TRANSACTION: "/Transacciones/obtenerTransaccion";
        readonly UPDATE_TRANSACTION: "/Transacciones/actualizarTransaccion";
    };
};
