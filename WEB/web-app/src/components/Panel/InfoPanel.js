import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export const InfoPanel = ({ msj }) => {
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "card shadow-sm mt-5", children: [_jsx("div", { className: "card-header", children: _jsx("span", { className: "card-title text-gray-600", children: "Informaci\u00F3n" }) }), _jsx("div", { className: "card-body d-flex flex-column align-items-center", children: _jsx("p", { className: "text-muted", children: msj }) })] }) }));
};
