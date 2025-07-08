import { DTO_Estado } from '@/models';
import { DTO_Param } from './DTO_Param';
export declare class DTO_Negocio {
    iD_Negocio: number;
    iD_Usuario: number;
    estado: DTO_Estado;
    nombreNegocio: string;
    descripcion: string;
    direccion: string;
    telefonoNegocio: string;
    correoNegocio: string;
    fechaRegistro: Date;
    referenciaJSON: Array<DTO_Param>;
}
