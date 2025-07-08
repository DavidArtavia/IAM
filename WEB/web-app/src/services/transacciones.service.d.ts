import { Observable } from 'rxjs';
import { DTO_Negocio, DTO_Respuesta, DTO_Transacciones } from "@/models";
export declare class transaccionesService {
    static obtenerTransaccion(negocio: DTO_Negocio | null): Observable<DTO_Respuesta>;
    static registrarTransaccion(transacciones: DTO_Transacciones | null): Observable<DTO_Respuesta>;
    static actualizarTransaccion(transacciones: DTO_Transacciones | null): Observable<DTO_Respuesta>;
}
