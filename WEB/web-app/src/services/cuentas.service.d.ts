import { Observable } from 'rxjs';
import { DTO_Cuenta } from '@/models/DTO_Cuenta';
import { DTO_Negocio, DTO_Respuesta } from '@/models';
export declare class cuentasService {
    static obtenerCuentas(negocio: DTO_Negocio | null): Observable<DTO_Respuesta>;
    static registrarCuenta(cuenta: DTO_Cuenta | null): Observable<DTO_Respuesta>;
    static actualizarCuenta(cuenta: DTO_Cuenta | null): Observable<DTO_Respuesta>;
}
