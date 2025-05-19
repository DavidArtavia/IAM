import { DTO_Usuario } from "@/models";

export const validatorNotify = (values: DTO_Usuario): void => {
    const { nombreUsuario, apellido, telefonoUsuario, correoUsuario, pass } = values;
    
    if (!/^[a-zA-Z\s]+$/.test(nombreUsuario)) {
        throw new Error("ValidationError: El nombre solo debe contener letras y espacios.");
    }
    
    if (!/^[a-zA-Z\s]+$/.test(apellido)) {
        throw new Error("ValidationError: El apellido solo debe contener letras y espacios.");
    }
    
    if (!/^\d{8}$/.test(telefonoUsuario)) {
        throw new Error("ValidationError: El teléfono debe contener exactamente 8 dígitos numéricos.");
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoUsuario)) {
        throw new Error("ValidationError: Por favor, ingresa un correo electrónico válido.");
    }
    
    if (pass.length < 6) {
        throw new Error("ValidationError: La contraseña debe tener al menos 6 caracteres.");
    }
};