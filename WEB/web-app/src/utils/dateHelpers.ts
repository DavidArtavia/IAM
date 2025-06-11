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

  static formatRelativeOrDate(fecha?: Date | string): string {
    if (!fecha) return "Ahora";

    // 1) etiqueta tipo "5s", "10m", "3H", "2D", "1M"
    const diffLabel = this.formatTimeDifference(fecha);

    // 3) para "s", "m" o "H" devolvemos la etiqueta directa
    return diffLabel === "0s" ? "Ahora" : diffLabel;
  }
}