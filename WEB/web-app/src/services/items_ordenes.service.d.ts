import { Observable } from 'rxjs';
import { DTO_ItemOrdenServicio, DTO_Respuesta } from "@/models";
export declare class itemsOrdenesService {
    static obtenerItemsOrdensDeServicio(itemsOrden: DTO_ItemOrdenServicio | null): Observable<DTO_Respuesta>;
    static registrarItemsOrdensDeServicio(itemsOrden: DTO_ItemOrdenServicio | null): Observable<DTO_Respuesta>;
    static actualizarItemsOrdensDeServicio(itemsOrden: DTO_ItemOrdenServicio | null): Observable<DTO_Respuesta>;
}
