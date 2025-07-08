import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants";
import { Clientes, Cuentas, Home, LayoutMain, Metricas, Monitor, Negocio, OrdenDeServicio, Transacciones, } from "@/screens";
import { Login, SignUp } from "@/auth";
import { ChatAi } from "@/components";
import { RedirectIfAuth, RequireAuth } from "@/utils";
import { useEffect } from "react";
export const AppRouter = () => {
    const { pathname } = useLocation(); //ruta actual
    useEffect(() => {
        //activamos el cerrado automático del menu cuando está en 
        // dimenciones pequeñas y cada vez que se cambie de ruta
        document.querySelectorAll(".drawer-overlay").forEach((el) => el.click());
    }, [pathname]);
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: ROUTES.LOGIN, replace: true }) }), _jsxs(Route, { element: _jsx(RedirectIfAuth, {}), children: [_jsx(Route, { path: ROUTES.LOGIN, element: _jsx(Login, {}) }), _jsx(Route, { path: ROUTES.SIGNUP, element: _jsx(SignUp, {}) })] }), _jsx(Route, { element: _jsx(RequireAuth, {}), children: _jsxs(Route, { element: _jsx(LayoutMain, {}), children: [_jsx(Route, { path: ROUTES.HOME, element: _jsx(Home, {}) }), _jsx(Route, { path: ROUTES.CHAT_AI, element: _jsx(ChatAi, {}) }), _jsx(Route, { path: ROUTES.NEGOCIO, element: _jsx(Negocio, {}) }), _jsx(Route, { path: ROUTES.MONITOR, element: _jsx(Monitor, {}) }), _jsx(Route, { path: ROUTES.CUENTAS, element: _jsx(Cuentas, {}) }), _jsx(Route, { path: ROUTES.CLIENTES, element: _jsx(Clientes, {}) }), _jsx(Route, { path: ROUTES.TRANSACTIONS, element: _jsx(Transacciones, {}) }), _jsx(Route, { path: ROUTES.SERVICE_ORDER, element: _jsx(OrdenDeServicio, {}) }), _jsx(Route, { path: ROUTES.METRICAS, element: _jsx(Metricas, {}) })] }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: ROUTES.LOGIN, replace: true }) })] }));
};
