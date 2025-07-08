import { defer, map } from 'rxjs';
import { API_ENDPOINTS } from "@/constants";
import { api } from '@/api';
export class usuarioService {
    constructor() { }
    static autenticarUsuario(usuario) {
        return defer(() => api.post(API_ENDPOINTS.AUTH.LOGIN, usuario)).pipe(map((r) => r.data));
    }
    static registrarUsuario(usuario) {
        return defer(() => api.post(API_ENDPOINTS.USERS.CREATE, usuario)).pipe(map((r) => r.data));
    }
}
