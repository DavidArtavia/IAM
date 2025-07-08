import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGenericForm } from "@/hooks/useGenericForm";
/**
 * Modal genérico para creación/edición de entidades.
 * Soporta:
 * - type="custom"   → renderer personalizado
 * - type="textarea"
 * - type="select"
 * - type="date"     → lógico: vacío si no hay fecha válida
 * - type="number"
 * - type="text"
 */
export const GenericFormModal = ({ title, show, onHide, data, setData, onSubmit, fields, }) => {
    const { errors, touched, wasSubmitted, localDisplay, handleChange, handleBlur, handleSubmit, } = useGenericForm(data, setData, fields, show, onSubmit);
    if (!show)
        return null;
    const renderField = (field, idx) => {
        const { key, label, type = "text", options, renderer } = field;
        const rawVal = data[key];
        const localVal = localDisplay[key];
        const shouldShowError = touched[key] || wasSubmitted;
        const errorMsg = shouldShowError ? errors[key] : "";
        const inputClass = `form-control form-control-solid ${errorMsg ? (_jsx("div", { className: "invalid-feedback d-block", children: errorMsg })) : null}`;
        const wrapperClass = type === "custom"
            ? idx < 2
                ? "col-md-6 fv-row"
                : "d-flex flex-column mb-5 fv-row"
            : type === "date"
                ? "d-flex flex-column mb-5 fv-row"
                : idx < 2
                    ? "col-md-6 fv-row"
                    : "d-flex flex-column mb-5 fv-row";
        const labelClass = idx < 2
            ? "required fs-5 fw-bold mb-2"
            : "required fs-5 fw-bold mb-2 mt-6";
        // ────────────────────────────────
        // 1) CUSTOM
        // ────────────────────────────────
        if (type === "custom" && renderer) {
            return (_jsxs("div", { className: wrapperClass, children: [_jsx("label", { htmlFor: String(key), className: labelClass, children: label }), renderer({
                        value: rawVal,
                        onChange: (val) => {
                            setData({ ...data, [key]: val });
                            handleBlur(key);
                        },
                    }), errorMsg ? (_jsx("div", { className: "invalid-feedback d-block", children: errorMsg })) : null] }, String(key)));
        }
        // ────────────────────────────────
        // 2) TEXTAREA
        // ────────────────────────────────
        if (type === "textarea") {
            return (_jsxs("div", { className: wrapperClass, children: [_jsx("label", { htmlFor: String(key), className: labelClass, children: label }), _jsx("textarea", { id: String(key), className: inputClass, value: String(rawVal ?? ""), onChange: (e) => handleChange(key, e.target.value, "text"), onBlur: () => handleBlur(key) }), errorMsg ? (_jsx("div", { className: "invalid-feedback d-block", children: errorMsg })) : null] }, String(key)));
        }
        // ────────────────────────────────
        // 3) SELECT
        // ────────────────────────────────
        if (type === "select") {
            return (_jsxs("div", { className: wrapperClass, children: [_jsx("label", { htmlFor: String(key), className: labelClass, children: label }), _jsxs("select", { id: String(key), className: inputClass, value: String(rawVal ?? ""), onChange: (e) => handleChange(key, e.target.value, "select"), onBlur: () => handleBlur(key), required: true, children: [_jsx("option", { value: "", children: "\u2013 Seleccione \u2013" }), options?.map((opt) => (_jsx("option", { value: String(opt.value), children: opt.label }, String(opt.value))))] }), errorMsg ? (_jsx("div", { className: "invalid-feedback d-block", children: errorMsg })) : null] }, String(key)));
        }
        // ────────────────────────────────
        // 4) DATE (Vacío si no hay fecha válida)
        // ────────────────────────────────
        if (type === "date") {
            // Interpretar rawVal
            const parsed = rawVal ? new Date(String(rawVal)) : null;
            const valid = parsed instanceof Date &&
                !isNaN(parsed.getTime()) &&
                parsed.getFullYear() >= 1753;
            // Valor: primero lo que el usuario tipeó, si no, la ISO válida, sino cadena vacía
            const dateVal = localVal ?? (valid ? parsed.toISOString().slice(0, 10) : "");
            return (_jsxs("div", { className: wrapperClass, children: [_jsx("label", { htmlFor: String(key), className: labelClass, children: label }), _jsx("input", { id: String(key), type: "date", className: inputClass, value: dateVal, onChange: (e) => handleChange(key, e.target.value, "date"), onBlur: () => handleBlur(key) }), errorMsg ? (_jsx("div", { className: "invalid-feedback d-block", children: errorMsg })) : null] }, String(key)));
        }
        // ────────────────────────────────
        // 5) NUMBER Y TEXT POR DEFECTO
        // ────────────────────────────────
        return (_jsxs("div", { className: wrapperClass, children: [_jsx("label", { htmlFor: String(key), className: labelClass, children: label }), _jsx("input", { id: String(key), type: type, className: inputClass, value: type === "number"
                        ? String(localVal ?? rawVal ?? "")
                        : String(rawVal ?? ""), onChange: (e) => handleChange(key, e.target.value, type), onBlur: () => handleBlur(key) }), errorMsg ? (_jsx("div", { className: "invalid-feedback d-block", children: errorMsg })) : null] }, String(key)));
    };
    return (_jsx("div", { className: "modal fade show d-block shadowDarkBackground", onClick: onHide, children: _jsx("div", { className: "modal-dialog modal-dialog-centered mw-650px", onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { children: title }), _jsx("button", { type: "button", className: "btn btn-sm btn-icon btn-active-color-primary", onClick: onHide, children: "\u2715" })] }), _jsxs("form", { onSubmit: (e) => {
                            e.preventDefault();
                            handleSubmit();
                        }, children: [_jsx("div", { className: "modal-body py-10 px-lg-17", children: _jsx("div", { className: "row mb-5", children: fields.map(renderField) }) }), _jsxs("div", { className: "modal-footer flex-center", children: [_jsx("button", { type: "button", className: "btn btn-light me-3", onClick: onHide, children: "Cancelar" }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: Object.values(errors).some((e) => !!e), children: "Guardar" })] })] })] }) }) }));
};
