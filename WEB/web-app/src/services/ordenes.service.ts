import { Observable, defer } from 'rxjs';
import { map } from 'rxjs';
import { DTO_Negocio, DTO_Respuesta } from "@/models";
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import { AxiosResponse } from 'axios';
import { DTO_OrdenServicio } from '@/models/DTO_OrdenesDeServicio';


export class ordenesService {

    static obtenerOrdensDeServicio(negocio: DTO_Negocio | null): Observable<DTO_Respuesta> {
        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.ORDERS.GET_ORDERS, negocio)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
    
    static registrarOrdensDeServicio(orden: DTO_OrdenServicio | null): Observable<DTO_Respuesta> {
        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.ORDERS.ADD_ORDER, orden as DTO_OrdenServicio)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
    
    static actualizarOrdensDeServicio(orden: DTO_OrdenServicio | null): Observable<DTO_Respuesta> {
        return defer(() =>
            api.post<DTO_Respuesta>(API_ENDPOINTS.ORDERS.UPDATE_ORDER, orden as DTO_OrdenServicio)
        ).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }
}