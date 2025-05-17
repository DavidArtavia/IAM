import { DTO_Estado } from './DTO_Estado';

export class DTO_Negocio {
    iD_Negocio: number = 0;
    iD_Usuario: number = 0;
    estado: DTO_Estado = new DTO_Estado();
    nombreNegocio: string = '';
    descripcion: string = '';
    direccion: string = '';
    telefonoNegocio: string = '';
    correoNegocio: string = '';
    fechaRegistro: Date = new Date();
    referenciaJSON: string = '';
}
