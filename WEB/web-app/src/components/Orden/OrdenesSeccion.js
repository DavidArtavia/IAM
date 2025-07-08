import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OrdenServicioCard } from "./OrdenServicioCard";
export const OrdenesSeccion = ({ titulo, colorBarra, estado, ordenes, items, onAvanceChange, onEstadoChange, onClickCreateCount, // Placeholder for future use
 }) => {
    const ordenesFiltradas = ordenes.filter((o) => o.estado.iD_Estado === estado);
    return (_jsxs("div", { className: "col-md-3 col-lg-12 col-xl-3", children: [_jsxs("div", { className: "mb-9", children: [_jsx("div", { className: "d-flex flex-stack", children: _jsxs("div", { className: "fw-bolder fs-4", children: [titulo, _jsx("span", { className: "fs-6 text-gray-400 ms-2", children: ordenesFiltradas.length })] }) }), _jsx("div", { className: `h-3px w-100 ${colorBarra}` })] }), ordenesFiltradas.map((orden) => (_jsx(OrdenServicioCard, { orden: orden, items: items.filter((i) => i.iD_OrdenServicio === orden.iD_OrdenServicio), onAvanceChange: onAvanceChange, onEstadoChange: onEstadoChange, onClickCreateCount: onClickCreateCount }, orden.iD_OrdenServicio)))] }));
};
