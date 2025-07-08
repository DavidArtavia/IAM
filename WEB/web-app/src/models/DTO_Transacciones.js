import { DTO_Estado } from "./DTO_Estado";
export class DTO_Transacciones {
    constructor() {
        Object.defineProperty(this, "iD_Transaccion", {
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
        Object.defineProperty(this, "concepto", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "monto", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "tipo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "numReferencia", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "tipoNumReferencia", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "fechaTransaccion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Date()
        });
    }
}
