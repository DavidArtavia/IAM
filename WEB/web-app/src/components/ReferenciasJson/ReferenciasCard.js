import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ReferenciaCards = ({ items }) => {
    if (items.length === 0) {
        return _jsx("span", { className: "badge badge-light-muted", children: "Sin referencias" });
    }
    return (_jsx("div", { className: "d-flex flex-wrap gap-2 p-1", children: items.map((ref) => (_jsxs("span", { className: "badge badge-light fw-semibold px-3 py-2 d-flex align-items-center", children: [_jsxs("span", { className: "text-primary fw-bold me-1", children: [ref.nombre, ":"] }), _jsx("span", { className: "text", children: ref.valor ? ` ${ref.valor}` : "" })] }))) }));
};
