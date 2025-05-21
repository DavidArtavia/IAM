export class dateHelpers {

    constructor() { }
    static formatFechaDDMMYYYY(fecha?: Date | string): string {
        if (!fecha) { return ""; }

        const d = fecha instanceof Date ? fecha : new Date(fecha);
        if (isNaN(d.getTime())) { return ""; }

        return d.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    static formatTimeDifference(fecha?: Date | string): string {
    if (!fecha) return "";
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(d.getTime())) return "";

    const now = Date.now();
    let diff = now - d.getTime();
    if (diff < 0) diff = -diff; // en caso de fechas futuras

    const msInSecond = 1000;
    const msInMinute = msInSecond * 60;
    const msInHour   = msInMinute * 60;
    const msInDay    = msInHour   * 24;
    const msInMonth  = msInDay    * 30; // aproximación

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
}