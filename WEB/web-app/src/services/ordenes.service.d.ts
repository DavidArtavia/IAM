import { Observable } from 'rxjs';
import { DTO_Negocio, DTO_Respuesta, DTO_OrdenServicio } from "../models";
export class ordenesService {
    static obtenerOrdensDeServicio(negocio: DTO_Negocio | null): Observable<DTO_Respuesta>;
    static registrarOrdensDeServicio(orden: DTO_OrdenServicio | null): Observable<DTO_Respuesta>;
    static actualizarOrdensDeServicio(orden: DTO_OrdenServicio | null): Observable<DTO_Respuesta>;
}
