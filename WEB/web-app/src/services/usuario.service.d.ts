import { DTO_Usuario, DTO_Respuesta } from 'models';
import { Observable } from 'rxjs';
export declare class usuarioService {
    constructor();
    static autenticarUsuario(usuario: DTO_Usuario | null): Observable<DTO_Respuesta>;
    static registrarUsuario(usuario: DTO_Usuario | null): Observable<DTO_Respuesta>;
}
