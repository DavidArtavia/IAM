//Este validador la idea es que se use en cada validador especifico, por ejempplo Valida_DTO_OrsenServicio
export class validadorGenerico {
    static isEmpty(value: any): boolean {
        return value === null || value === undefined || String(value).trim() === '';
    }

    static hasMinLength(value: string, min: number): boolean {
        return value.length >= min;
    }

    static hasMaxLength(value: string, max: number): boolean {
        return value.length <= max;
    }

    static isEmail(value: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
    }
    static isCero(value: number): boolean {
        return value == 0
    }

    static isNumeric(value: any): boolean {
        return !isNaN(value);
    }

    static isDate(value: any): boolean {
        return !isNaN(new Date(String(value)).getTime());
    }

    static matches(value: string, compare: string): boolean {
        return value === compare;
    }

    static hasNoSpecialChars(value: string): boolean {
        return /^[a-zA-Z0-9\s]*$/.test(value);
    }

    static isEmojiFree(value: string): boolean {
        const emojiRegex = /[\p{Extended_Pictographic}]/u;
        return !emojiRegex.test(value);
    }

}
