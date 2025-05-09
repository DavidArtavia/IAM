import { DTO_Estado } from "./DTO_Estado";
import { DTO_Rol } from "./DTO_Rol";


export class DTO_Usuario{
    ID_Usuario: number = 0;
    NombreUsuario: string = '';
    Apellido: string = '';
    TelefonoUsuario: string = '';
    CorreoUsuario: string = '';
    Pass: string = '';
    Estado: DTO_Estado = new DTO_Estado();
    Rol: DTO_Rol = new DTO_Rol();
}