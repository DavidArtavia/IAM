import { DTO_Estado } from '@/models';
export class DTO_ChatIA {
    constructor() {
        Object.defineProperty(this, "iD_ChatIA", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "iD_Negocio", {
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
        Object.defineProperty(this, "fechaInicial", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Date()
        });
        Object.defineProperty(this, "fechaFinal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        Object.defineProperty(this, "mensajesChat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
}
