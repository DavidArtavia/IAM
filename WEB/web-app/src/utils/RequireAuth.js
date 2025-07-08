import { jsx as _jsx } from "react/jsx-runtime";
// RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants";
import { LoadingModal } from "@/components";
import { useAuthCheck } from "@/hooks";
export const RequireAuth = () => {
    const isAuth = useAuthCheck();
    const { pathname, search } = useLocation();
    const lastPath = pathname + search;
    localStorage.setItem("lastPath", lastPath);
    if (isAuth === null)
        return _jsx(LoadingModal, { loadingMessage: "Verificando..." });
    return isAuth ? _jsx(Outlet, {}) : _jsx(Navigate, { to: ROUTES.LOGIN, replace: true });
};
