export class DTO_Respuesta {
    constructor() {
        Object.defineProperty(this, "tipoRespuesta", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "mensaje", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "codigo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "resultado", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
}
