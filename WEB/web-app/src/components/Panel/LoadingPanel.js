import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export const LoadingPanel = ({ msj }) => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 1500);
        return () => clearTimeout(timer);
    }, []);
    if (!show)
        return null;
    return (_jsxs("div", { className: "d-flex flex-column align-items-center justify-content-center my-5", children: [_jsx("div", { className: "spinner-border text-primary mb-3 spinner-border-lg", role: "status" }), _jsx("span", { className: "fw-semibold text-secondary", style: { fontSize: 18 }, children: msj ? msj : "Cargando datos..." })] }));
};
