import { Observable } from 'rxjs';
import { DTO_Negocio, DTO_Respuesta } from "@/models";
export declare class monitorService {
    static cargarMonitorOrdenServicio(negocio: DTO_Negocio | null): Observable<DTO_Respuesta>;
}
