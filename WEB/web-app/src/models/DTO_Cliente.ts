export class DTO_Cliente {
    id_Cliente: number = 0;
    id_Usuario: number = 0; // Corresponde al ID de Usuario (FK)
    nombreCliente: string = "";
    apellidoCliente: string = "";
    telefonoCliente: string = "";
    correoCliente: string = "";
}