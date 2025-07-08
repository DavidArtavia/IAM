import { DTO_Estado } from '@/models';
export class DTO_Negocio {
    constructor() {
        Object.defineProperty(this, "iD_Negocio", {
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
        });
        Object.defineProperty(this, "estado", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new DTO_Estado()
        });
        Object.defineProperty(this, "nombreNegocio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "descripcion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "direccion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "telefonoNegocio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "correoNegocio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "fechaRegistro", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Date()
        });
        Object.defineProperty(this, "referenciaJSON", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
}
