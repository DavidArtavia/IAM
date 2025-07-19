import { Observable, defer } from 'rxjs';
import { map } from 'rxjs';
import { DTO_Cuenta, DTO_Negocio, DTO_Respuesta, DTO_Transacciones } from "@/models";
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import { AxiosResponse } from 'axios';


export class transaccionesService {

    static obtenerTransaccion(negocio: DTO_Negocio | null): Observable<DTO_Respuesta> {
        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.TRANSACTIONS.GET_TRANSACTION, negocio)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
    static obtenerTransaccionPorCuenta(cuenta: DTO_Cuenta): Observable<DTO_Respuesta> {
        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.TRANSACTIONS.GET_TRANSACTION_BY_ACCOUNT, cuenta )).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
    
    static registrarTransaccion(transacciones: DTO_Transacciones | null): Observable<DTO_Respuesta> {
        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.TRANSACTIONS.ADD_TRANSACTION, transacciones)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
    
    static actualizarTransaccion(transacciones: DTO_Transacciones | null): Observable<DTO_Respuesta> {
        return defer(() =>
            api.post<DTO_Respuesta>(API_ENDPOINTS.TRANSACTIONS.UPDATE_TRANSACTION, transacciones)
        ).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
}