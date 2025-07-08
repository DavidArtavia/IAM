import { defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
export class negocioService {
    static obtenerNegocios(filtroEstado) {
        return defer(() => api.post(API_ENDPOINTS.BUSINESS.GET_BUSINESS, filtroEstado)).pipe(map((r) => r.data));
    }
    static registrarNegocio(negocios) {
        return defer(() => api.post(API_ENDPOINTS.BUSINESS.ADD_BUSINESS, negocios)).pipe(map((r) => r.data));
    }
    static actualizarNegocio(negocios) {
        return defer(() => api.post(API_ENDPOINTS.BUSINESS.UPDATE_BUSINESS, negocios)).pipe(map((r) => r.data));
    }
}
