export const required =
    (message: string = "Este campo es requerido") =>
    (value: string | null | undefined): string | null => {
        return String(value || "").trim() === "" ? message : null;
    };

export const isEmail =
    (message: string = "Correo inválido") =>
    (value: string): string | null => {
        return /^\S+@\S+\.\S+$/.test(value) ? null : message;
    };

export const minLength = (length: number, message?: string) => 
    (value: string): string | null => {
        return value.length < length ? message || `Mínimo de ${length} caracteres` : null;
    };

export const isPhoneNumber =
    (message: string = "Debe ser un número de 8 dígitos") =>
    (value: string): string | null => {
        const phoneRegex = /^\d{8}$/;
        return phoneRegex.test(value) ? null : message;
    };