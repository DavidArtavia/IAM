import { Observable, defer } from 'rxjs';
import { map } from 'rxjs';
import { DTO_Negocio, DTO_Respuesta } from "@/models";
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import { AxiosResponse } from 'axios';


export class monitorService {

    static cargarMonitorOrdenServicio(negocio: DTO_Negocio | null): Observable<DTO_Respuesta> {

        return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.MONITOR.GET_MONITOR_OS, negocio)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
    }

}