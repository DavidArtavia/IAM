import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// === 1. Importación necesaria
import { RESTRICCIONES } from "@/constants";
import React, { useEffect, useState } from "react";
export const ReferenciasJsonInput = ({ value = [], onChange, hideCheckbox = false, editable = true, }) => {
    const [enabled, setEnabled] = useState(hideCheckbox || value.length > 0);
    const [referencias, setReferencias] = useState(value);
    const limiteDeReferencias = referencias.length >= RESTRICCIONES.MAX_REFERENCIAS; // Máximo de referencias permitidas
    useEffect(() => {
        onChange(referencias);
    }, [referencias]);
    const handleAdd = () => {
        if (limiteDeReferencias)
            return;
        setReferencias([...referencias, { nombre: "", valor: "", _nuevo: true }]);
    };
    const handleChange = (index, campo, nuevoValor) => {
        const nuevas = [...referencias];
        nuevas[index][campo] = nuevoValor;
        setReferencias(nuevas);
    };
    const handleDelete = (index) => {
        const nuevas = referencias.filter((_, i) => i !== index);
        setReferencias(nuevas);
    };
    const handleToggle = () => {
        const nextState = !enabled;
        setEnabled(nextState);
        if (nextState && referencias.length === 0) {
            setReferencias([{ nombre: "", valor: "", _nuevo: true }]);
        }
        else if (!nextState) {
            setReferencias([]);
        }
    };
    return (_jsxs("div", { className: "d-flex flex-column", children: [!hideCheckbox && (_jsx(_Fragment, { children: _jsxs("div", { className: "form-check form-switch form-check-custom form-check-solid", children: [_jsx("input", { className: "form-check-input", id: "toggle-switch", type: "checkbox", checked: enabled, onChange: handleToggle }), _jsx("label", { className: "form-check-label", htmlFor: "toggle-switch" })] }) })), (enabled || hideCheckbox) && (_jsxs(_Fragment, { children: [_jsx("div", { className: "row g-4 mb-4 mt-1", children: referencias.map((ref, idx) => {
                            const isEditable = editable || ref._nuevo;
                            return (_jsx(React.Fragment, { children: _jsx("div", { className: "col-md-6", children: _jsxs("div", { className: "position-relative", children: [_jsx("input", { className: "form-control form-control-solid pe-10", placeholder: "Nombre *", value: ref.nombre, onChange: (e) => isEditable
                                                    ? handleChange(idx, "nombre", e.target.value)
                                                    : undefined, required: true, disabled: !isEditable }), _jsx("button", { type: "button", className: "btn btn-icon btn-sm position-absolute top-50 end-0 translate-middle-y me-2", onClick: () => handleDelete(idx), title: "Eliminar", children: _jsx("i", { className: "bi bi-trash", style: {
                                                        fontSize: "1.2rem",
                                                        transition: "color 0.2s, font-size 0.2s",
                                                    }, onMouseEnter: (e) => {
                                                        e.currentTarget.style.color = "red";
                                                        e.currentTarget.style.fontSize = "1.5rem";
                                                    }, onMouseLeave: (e) => {
                                                        e.currentTarget.style.color = "";
                                                        e.currentTarget.style.fontSize = "1.2rem";
                                                    } }) })] }) }) }, idx));
                        }) }), limiteDeReferencias && (_jsxs("div", { className: "alert alert-warning mt-2 py-2 px-3 small", role: "alert", children: [_jsx("i", { className: "bi bi-exclamation-triangle-fill me-2" }), "L\u00EDmite alcanzado: solo puede crear hasta", " ", RESTRICCIONES.MAX_REFERENCIAS, " referencias."] })), _jsx("button", { type: "button", className: "btn btn-outline btn-outline-dashed btn-outline-dark", onClick: handleAdd, disabled: limiteDeReferencias, children: limiteDeReferencias ? "Máximo alcanzado" : "Agregar referencia" })] }))] }));
};
