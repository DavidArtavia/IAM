import { Observable } from 'rxjs';
import { DTO_Cliente, DTO_Respuesta } from '@/models';
export declare class clientesService {
    static buscarClientes(term: string | null): Observable<DTO_Cliente[]>;
    static obtenerClientes(): Observable<DTO_Respuesta>;
    static actualizarClientes(cliente: DTO_Cliente): Observable<DTO_Respuesta>;
    static registrarClientes(cliente: DTO_Cliente): Observable<DTO_Respuesta>;
}
