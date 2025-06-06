import { Observable, defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import { AxiosResponse } from 'axios';
import { DTO_FiltroEstado, DTO_Negocio, DTO_Respuesta } from '@/models';

export class negocioService {

    static obtenerNegocios(filtroEstado: DTO_FiltroEstado | null): Observable<DTO_Respuesta> {
        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.BUSINESS.GET_BUSINESS, filtroEstado)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
    
    static registrarNegocio(negocios: DTO_Negocio | null): Observable<DTO_Respuesta> {
        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.BUSINESS.ADD_BUSINESS, negocios as DTO_Negocio)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
    
    static actualizarNegocio(negocios: DTO_Negocio | null): Observable<DTO_Respuesta> {
        return defer(() =>
            api.post<DTO_Respuesta>(API_ENDPOINTS.BUSINESS.UPDATE_BUSINESS, negocios as DTO_Negocio)
        ).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
}