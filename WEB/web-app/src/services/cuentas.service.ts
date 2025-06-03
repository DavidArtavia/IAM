import { Observable, defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import { AxiosResponse } from 'axios';
import { DTO_CuentasPorPagar } from '@/models/DTO_CuentasPorPagar';
import { DTO_Negocio } from '@/models';

export class cuentasService {

    static obtenerCuentasPorPagar(negocio: DTO_Negocio | null): Observable<DTO_CuentasPorPagar> {
        return defer(() => api.post<DTO_CuentasPorPagar>(API_ENDPOINTS.ACCOUNTS_PAYABLE.GET_ACCOUNTS,negocio as DTO_Negocio)).pipe(map((r: AxiosResponse<DTO_CuentasPorPagar>) => r.data));
    }
    static registrarCuentasPorPagar(cuentasPorPagar: DTO_CuentasPorPagar | null): Observable<DTO_CuentasPorPagar> {
        return defer(() => api.post<DTO_CuentasPorPagar>(API_ENDPOINTS.ACCOUNTS_PAYABLE.ADD_ACCOUNT, cuentasPorPagar as DTO_CuentasPorPagar)).pipe(map((r: AxiosResponse<DTO_CuentasPorPagar>) => r.data));
    }

    static actualizarCuentasPorPagar(cuentasPorPagar: DTO_CuentasPorPagar | null): Observable<DTO_CuentasPorPagar> {
        return defer(() =>
            api.post<DTO_CuentasPorPagar>(API_ENDPOINTS.ACCOUNTS_PAYABLE.UPDATE_ACCOUNT, cuentasPorPagar as DTO_CuentasPorPagar)
        ).pipe(map((r: AxiosResponse<DTO_CuentasPorPagar>) => r.data));
    }
}