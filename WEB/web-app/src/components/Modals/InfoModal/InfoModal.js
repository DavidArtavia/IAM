import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ReferenciaCards } from "@/components/ReferenciasJson/ReferenciasCard";
import { dateHelpers } from "@/utils";
/**
 * Intenta formatear un valor como fecha si es válido y superior a 1753.
 */
const tryParseDate = (val) => {
    if (!val)
        return null;
    const asDate = val instanceof Date
        ? val
        : typeof val === "string" || typeof val === "number"
            ? new Date(val)
            : new Date(NaN);
    if (isNaN(asDate.getTime()) || asDate.getFullYear() < 1753)
        return null;
    return dateHelpers.formatFechaDDMMYYYY(asDate);
};
/**
 * Renderiza un valor según su tipo (string, objeto, array, fecha, primitivo)
 */
const renderValue = (key, value, labelMap, dateKeys) => {
    // 1) Fechas
    if (dateKeys?.includes(key)) {
        const maybeDate = tryParseDate(value);
        if (maybeDate !== null)
            return _jsx("span", { children: maybeDate });
        if (typeof value === "string" && value.startsWith("0001-01-01")) {
            return (_jsx("span", { className: "badge bg-warning text-dark", children: "No se ha definido a\u00FAn" }));
        }
    }
    // 2) Array
    if (Array.isArray(value)) {
        if (value.length === 0)
            return _jsx("span", { className: "text-muted", children: "[Sin datos]" });
        const allNamed = value.every((item) => typeof item === "object" &&
            item !== null &&
            "nombre" in item &&
            "valor" in item);
        return allNamed ? (_jsx(ReferenciaCards, { items: value })) : (_jsx("pre", { className: "bg-light rounded p-2", style: { maxHeight: 200, overflowY: "auto" }, children: JSON.stringify(value, null, 2) }));
    }
    // 3) Objeto
    if (typeof value === "object" && value !== null) {
        if ("nombre" in value) {
            const nombre = String(value.nombre).toLowerCase();
            const badgeMap = {
                activo: "badge-light-success",
                nuevo: "badge badge-secondary",
                "en proceso": "badge-light-primary",
                "en espera": "badge-light-warning",
                completado: "badge-light-success",
                eliminado: "badge-light-danger",
                inactivo: "badge-light-light",
                default: "badge badge-dark",
            };
            const badgeClass = badgeMap[nombre] ?? badgeMap.default;
            return _jsx("span", { className: badgeClass, children: value.nombre });
        }
        return (_jsx("div", { className: "row gx-2", children: Object.entries(value).map(([k, v]) => (_jsxs("div", { className: "col-12 d-flex justify-content-between mb-1", children: [_jsxs("strong", { children: [labelMap[k] ?? k, ":"] }), _jsx("span", { children: String(v) })] }, k))) }));
    }
    // 4) Valores nulos o indefinidos
    if (value === undefined || value === null) {
        return _jsx("span", { className: "badge bg-secondary", children: "No disponible" });
    }
    // 5) Primitivos
    return _jsx("span", { children: String(value) });
};
/**
 * Componente modal reutilizable para mostrar información detallada de un objeto.
 */
export const InfoModal = ({ show, onHide, data, labelMap, title = "Información Detallada", dateKeys = [], // ⬅️ Se asegura valor por defecto
 }) => {
    if (!show)
        return null;
    return (_jsx("div", { className: "modal fade show d-block shadowDarkBackground", onClick: onHide, children: _jsx("div", { className: "modal-dialog modal-dialog-centered mw-650px", onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { children: title }), _jsx("button", { type: "button", className: "btn btn-sm btn-icon", onClick: onHide, children: "\u2715" })] }), _jsx("div", { className: "modal-body py-10 px-lg-17", children: _jsx("div", { className: "table-responsive", children: Object.entries(data).map(([key, val]) => (_jsxs("div", { className: "d-flex flex-stack py-5 border-bottom border-gray-300 border-bottom-dashed", children: [_jsx("div", { className: "d-flex align-items-center", children: _jsx("div", { className: "ms-6", children: _jsx("strong", { className: "fs-5 fw-bold text-dark", children: labelMap[key] ?? key }) }) }), _jsx("div", { className: "d-flex align-items-center", children: _jsx("div", { className: "ms-6", children: renderValue(key, val, labelMap, dateKeys) }) })] }, key))) }) }), _jsx("div", { className: "modal-footer flex-center", children: _jsx("button", { type: "button", className: "btn btn-light", onClick: onHide, children: "Cerrar" }) })] }) }) }));
};
