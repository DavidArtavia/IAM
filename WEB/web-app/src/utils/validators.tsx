import { DTO_Usuario } from "@/models/DTO_Usuario";

export const validatorNotify = (values: DTO_Usuario): void => {
    const { NombreUsuario, Apellido, TelefonoUsuario, CorreoUsuario, Pass } = values;
    
    if (!/^[a-zA-Z\s]+$/.test(NombreUsuario)) {
        throw new Error("ValidationError: El nombre solo debe contener letras y espacios.");
    }
    
    if (!/^[a-zA-Z\s]+$/.test(Apellido)) {
        throw new Error("ValidationError: El apellido solo debe contener letras y espacios.");
    }
    
    if (!/^\d{8}$/.test(TelefonoUsuario)) {
        throw new Error("ValidationError: El teléfono debe contener exactamente 8 dígitos numéricos.");
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CorreoUsuario)) {
        throw new Error("ValidationError: Por favor, ingresa un correo electrónico válido.");
    }
    
    if (Pass.length < 6) {
        throw new Error("ValidationError: La contraseña debe tener al menos 6 caracteres.");
    }
};