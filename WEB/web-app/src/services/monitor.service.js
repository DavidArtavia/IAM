import { defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
export class monitorService {
    static cargarMonitorOrdenServicio(negocio) {
        return defer(() => api.post(API_ENDPOINTS.MONITOR.GET_MONITOR_OS, negocio)).pipe(map((r) => r.data));
    }
}
