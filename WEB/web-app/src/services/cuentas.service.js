import { defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
export class cuentasService {
    static obtenerCuentas(negocio) {
        return defer(() => api.post(API_ENDPOINTS.ACCOUNTS_PAYABLE.GET_ACCOUNTS, negocio)).pipe(map((r) => r.data));
    }
    static registrarCuenta(cuenta) {
        return defer(() => api.post(API_ENDPOINTS.ACCOUNTS_PAYABLE.ADD_ACCOUNT, cuenta)).pipe(map((r) => r.data));
    }
    static actualizarCuenta(cuenta) {
        return defer(() => api.post(API_ENDPOINTS.ACCOUNTS_PAYABLE.UPDATE_ACCOUNT, cuenta)).pipe(map((r) => r.data));
    }
}
