import { DTO_Estado, DTO_Rol } from '@/models';
export declare class DTO_Usuario {
    iD_Usuario: number;
    nombreUsuario: string;
    apellido: string;
    telefonoUsuario: string;
    correoUsuario: string;
    pass: string;
    estado: DTO_Estado;
    rol: DTO_Rol;
}
