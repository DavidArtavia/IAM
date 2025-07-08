import { DTO_Estado } from "./DTO_Estado";
export class DTO_Cliente {
    constructor() {
        Object.defineProperty(this, "iD_Cliente", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "iD_Usuario", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        }); // Corresponde al ID de Usuario (FK)
        Object.defineProperty(this, "estado", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new DTO_Estado()
        }); // Corresponde al ID de Estado (FK)
        Object.defineProperty(this, "nombreCliente", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "apellidoCliente", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "telefonoCliente", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "correoCliente", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
    }
}
