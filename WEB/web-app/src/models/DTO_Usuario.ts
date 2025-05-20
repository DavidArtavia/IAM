import { DTO_Estado } from "./DTO_Estado";
import { DTO_Rol } from "./DTO_Rol";

export class DTO_Usuario {
    idUsuario: number = 0;
    nombreUsuario: string = '';
    apellido: string = '';
    telefonoUsuario: string = '';
    correoUsuario: string = '';
    pass: string = '';
    estado: DTO_Estado = new DTO_Estado();
    rol: DTO_Rol = new DTO_Rol();
}
