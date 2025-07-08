import { DTO_Usuario } from "@/models";
export declare class usuarioValidator {
    constructor();
    static validarDatosLogin(usuario: DTO_Usuario | null): boolean;
    static validarDatosRegistroUsuario(usuario: DTO_Usuario | null, confirmacionPass: string): boolean;
}
