import { DTO_Estado } from "@/models";
export class DTO_OrdenServicio {
    constructor() {
        Object.defineProperty(this, "iD_OrdenServicio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "iD_Cliente", {
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
        Object.defineProperty(this, "fechaOrdenServicio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "fechaEstimadaEntrega", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "fechaInicio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "fechaFinal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "fechaEntrega", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "notaOrdenServicio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "referenciaJSON", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
}
