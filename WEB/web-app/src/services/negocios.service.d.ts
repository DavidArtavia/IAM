import { Observable } from 'rxjs';
import { DTO_FiltroEstado, DTO_Negocio, DTO_Respuesta } from '@/models';
export declare class negocioService {
    static obtenerNegocios(filtroEstado: DTO_FiltroEstado | null): Observable<DTO_Respuesta>;
    static registrarNegocio(negocios: DTO_Negocio | null): Observable<DTO_Respuesta>;
    static actualizarNegocio(negocios: DTO_Negocio | null): Observable<DTO_Respuesta>;
}
