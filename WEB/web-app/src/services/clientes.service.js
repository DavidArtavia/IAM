import { defer, of } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
export class clientesService {
    static buscarClientes(term) {
        // 1) Validación previa
        if (!term || term.trim().length < 3) {
            return of([]);
        }
        // 2) Deferir la llamada hasta la subscripción
        return defer(() => api.post(API_ENDPOINTS.CLIENTS.SEARCH_CLIENTS, { term: term.trim() })).pipe(
        // 3) Extraer sólo el body
        map(response => response.data));
    }
    static obtenerClientes() {
        return defer(() => api.post(API_ENDPOINTS.CLIENTS.GET_CLIENTS)).pipe(map((r) => r.data));
    }
    static actualizarClientes(cliente) {
        return defer(() => api.post(API_ENDPOINTS.CLIENTS.UPDATE_CLIENT, cliente)).pipe(map((r) => r.data));
    }
    static registrarClientes(cliente) {
        return defer(() => api.post(API_ENDPOINTS.CLIENTS.ADD_CLIENT, cliente)).pipe(map((r) => r.data));
    }
}
