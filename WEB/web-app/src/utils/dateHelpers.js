export class dateHelpers {
    constructor() { }
    static formatFechaDDMMYYYY(fecha) {
        if (!fecha) {
            return "";
        }
        const d = fecha instanceof Date ? fecha : new Date(fecha);
        if (isNaN(d.getTime())) {
            return "";
        }
        return d.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }
    static formatTimeDifference(fecha) {
        if (!fecha)
            return "";
        const d = fecha instanceof Date ? fecha : new Date(fecha);
        if (isNaN(d.getTime()))
            return "";
        const now = Date.now();
        let diff = now - d.getTime();
        if (diff < 0)
            diff = -diff; // en caso de fechas futuras
        const msInSecond = 1000;
        const msInMinute = msInSecond * 60;
        const msInHour = msInMinute * 60;
        const msInDay = msInHour * 24;
        const msInMonth = msInDay * 30; // aproximación
        if (diff >= msInMonth) {
            const months = Math.floor(diff / msInMonth);
            return `${months}M`;
        }
        if (diff >= msInDay) {
            const days = Math.floor(diff / msInDay);
            return `${days}D`;
        }
        if (diff >= msInHour) {
            const hours = Math.floor(diff / msInHour);
            return `${hours}H`;
        }
        if (diff >= msInMinute) {
            const minutes = Math.floor(diff / msInMinute);
            return `${minutes}m`;
        }
        const seconds = Math.floor(diff / msInSecond);
        return `${seconds}s`;
    }
    static formatRelativeOrDate(fecha) {
        if (!fecha)
            return "Ahora";
        // 1) etiqueta tipo "5s", "10m", "3H", "2D", "1M"
        const diffLabel = this.formatTimeDifference(fecha);
        // 3) para "s", "m" o "H" devolvemos la etiqueta directa
        return diffLabel === "0s" ? "Ahora" : diffLabel;
    }
}
// Helper: convierte un rawDate (string "YYYY-MM-DD" o Date) a Date local a medianoche
Object.defineProperty(dateHelpers, "parseDateInput", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: (raw) => {
        if (!raw)
            return new Date(); // hoy
        if (raw instanceof Date)
            return raw; // ya es Date
        // raw es "YYYY-MM-DD"
        const [y, m, d] = raw.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        // Si inválida o año <1753, devolvemos hoy
        if (isNaN(dt.getTime()) || dt.getFullYear() < 1753) {
            return new Date();
        }
        return dt;
    }
});
