import { FieldConfig } from "@/components";

export interface ValidationRule<T = any> {
    validate: (value: T, data?: any) => string | null;
    message?: string;
}

export interface FieldValidationConfig {
    required?: boolean | string;
    minLength?: number | { value: number; message?: string };
    maxLength?: number | { value: number; message?: string };
    pattern?: RegExp | { value: RegExp; message?: string };
    email?: boolean | string;
    phone?: boolean | string;
    onlyLetters?: boolean | string;
    onlyNumbers?: boolean | string;
    lettersAndNumbers?: boolean | string;
    allowSpecialChars?: boolean | string;
    date?: boolean | string;
    min?: number | { value: number; message?: string };
    max?: number | { value: number; message?: string };
    custom?: ValidationRule[];
}

// Extender el FieldConfig existente
export interface EnhancedFieldConfig<T> extends FieldConfig<T> {
    validation?: FieldValidationConfig;
    sanitize?: (value: any) => any; // Para limpiar/formatear valores antes de validar
}