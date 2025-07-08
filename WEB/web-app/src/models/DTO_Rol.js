export class DTO_Rol {
    constructor() {
        Object.defineProperty(this, "iD_Rol", {
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
        }); // Este es el ID de usuario que es clave foránea
        Object.defineProperty(this, "nombreRol", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "descripcionRol", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
    }
}
