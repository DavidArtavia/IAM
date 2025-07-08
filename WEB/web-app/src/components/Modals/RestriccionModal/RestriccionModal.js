import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
export const RestriccionModal = ({ show, onClose, onSave, modalTitle = "Advertencia", modalTexto, }) => {
    const modalRef = useRef(null);
    useEffect(() => {
        if (show && navigator.vibrate) {
            navigator.vibrate([80, 40, 80]);
        }
        if (show && modalRef.current) {
            modalRef.current.classList.remove("shake-horizontal");
            // Trigger reflow to restart animation
            void modalRef.current.offsetWidth;
            modalRef.current.classList.add("shake-horizontal");
        }
    }, [show]);
    return (_jsx(_Fragment, { children: _jsx("div", { className: `modal fade${show ? " shake-horizontal show d-block shadowClearBackground " : ""}`, tabIndex: -1, role: "dialog", "aria-modal": show ? "true" : undefined, id: "kt_modal_1", children: _jsx("div", { className: "modal-dialog", role: "document", children: _jsxs("div", { className: "modal-content", ref: modalRef, children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: modalTitle }), _jsx("button", { type: "button", className: "btn btn-icon btn-sm btn-active-light-primary ms-2", "aria-label": "Close", onClick: onClose, children: _jsx("span", { className: "svg-icon svg-icon-2x" }) })] }), _jsx("div", { className: "modal-body", children: _jsx("p", { children: modalTexto }) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-light", onClick: onClose, children: "Cerrar" }), onSave ? (_jsx("button", { type: "button", className: "btn btn-primary", onClick: onSave, children: "Guardar cambios" })) : null] })] }) }) }) }));
};
