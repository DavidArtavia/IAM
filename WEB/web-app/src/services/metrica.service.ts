import { Observable, defer } from 'rxjs';
import { map } from 'rxjs';
import { DTO_MetricaKPI, DTO_Respuesta } from "@/models";
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import { AxiosResponse } from 'axios';


export class metricaService {

    static obtenerMetrica(metricaKPI: DTO_MetricaKPI | null): Observable<DTO_Respuesta> {
        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.METRICA.GET_METRICA, metricaKPI)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }

}