import { DTO_Estado } from "@/models";
export class DTO_ItemOrdenServicio {
    constructor() {
        Object.defineProperty(this, "iD_ItemOrdenServicio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "iD_OrdenServicio", {
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
        Object.defineProperty(this, "nombreItemOrdenServicio", {
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
        Object.defineProperty(this, "monto", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "avance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
}
