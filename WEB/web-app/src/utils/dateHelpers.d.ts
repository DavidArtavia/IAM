export declare class dateHelpers {
    constructor();
    static formatFechaDDMMYYYY(fecha?: Date | string): string;
    static formatTimeDifference(fecha?: Date | string): string;
    static formatRelativeOrDate(fecha?: Date | string): string;
    static parseDateInput: (raw?: string | Date | null) => Date;
}
