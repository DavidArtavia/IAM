import { DTO_Estado } from "./DTO_Estado";

export class DTO_Cliente {
    iD_Cliente: number = 0;
    iD_Usuario: number = 0; // Corresponde al ID de Usuario (FK)
    estado : DTO_Estado = new DTO_Estado(); // Corresponde al ID de Estado (FK)
    nombreCliente: string = "";
    apellidoCliente: string = "";
    telefonoCliente: string = "";
    correoCliente: string = "";
}