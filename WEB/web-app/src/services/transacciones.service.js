import { defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
export class transaccionesService {
    static obtenerTransaccion(negocio) {
        return defer(() => api.post(API_ENDPOINTS.TRANSACTIONS.GET_TRANSACTION, negocio)).pipe(map((r) => r.data));
    }
    static registrarTransaccion(transacciones) {
        return defer(() => api.post(API_ENDPOINTS.TRANSACTIONS.ADD_TRANSACTION, transacciones)).pipe(map((r) => r.data));
    }
    static actualizarTransaccion(transacciones) {
        return defer(() => api.post(API_ENDPOINTS.TRANSACTIONS.UPDATE_TRANSACTION, transacciones)).pipe(map((r) => r.data));
    }
}
