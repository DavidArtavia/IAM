import { defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
export class ordenesService {
    static obtenerOrdensDeServicio(negocio) {
        return defer(() => api.post(API_ENDPOINTS.ORDERS.GET_ORDERS, negocio)).pipe(map((r) => r.data));
    }
    static registrarOrdensDeServicio(orden) {
        return defer(() => api.post(API_ENDPOINTS.ORDERS.ADD_ORDER, orden)).pipe(map((r) => r.data));
    }
    static actualizarOrdensDeServicio(orden) {
        return defer(() => api.post(API_ENDPOINTS.ORDERS.UPDATE_ORDER, orden)).pipe(map((r) => r.data));
    }
}
