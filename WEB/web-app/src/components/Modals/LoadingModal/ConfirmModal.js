import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ConfirmModal = ({ show, confirmMessage, onAction, }) => {
    if (!show)
        return null;
    return (_jsx("div", { className: "modal fade show d-block shadowDarkBackground", onClick: () => onAction(null), children: _jsx("div", { className: "modal-dialog modal-dialog-centered", onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: "Confirmaci\u00F3n" }), _jsx("button", { type: "button", className: "btn-close", onClick: () => onAction(null) })] }), _jsx("div", { className: "modal-body", children: _jsx("p", { children: confirmMessage }) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { onClick: () => onAction(false), type: "button", className: "btn btn-secondary", children: "Cancelar" }), _jsx("button", { onClick: () => onAction(true), type: "button", className: "btn btn-primary", children: "Aceptar" })] })] }) }) }));
};
