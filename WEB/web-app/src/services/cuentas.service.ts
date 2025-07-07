import { Observable, defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import { AxiosResponse } from 'axios';
import { DTO_Cuenta } from '@/models/DTO_Cuenta';
import { DTO_Negocio, DTO_Respuesta } from '@/models';

export class cuentasService {

    static obtenerCuentas(negocio: DTO_Negocio | null): Observable<DTO_Respuesta> {
        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.ACCOUNTS_PAYABLE.GET_ACCOUNTS, negocio as DTO_Negocio)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
    static registrarCuenta(cuenta: DTO_Cuenta | null): Observable<DTO_Respuesta> {
        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.ACCOUNTS_PAYABLE.ADD_ACCOUNT, cuenta as DTO_Cuenta)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }

    static actualizarCuenta(cuenta: DTO_Cuenta | null): Observable<DTO_Respuesta> {
        return defer(() =>
            api.post<DTO_Respuesta>(API_ENDPOINTS.ACCOUNTS_PAYABLE.UPDATE_ACCOUNT, cuenta as DTO_Cuenta)
        ).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
}