import { jsx as _jsx } from "react/jsx-runtime";
// RedirectIfAuth.tsx
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/constants";
import { LoadingModal } from "@/components";
import { useAuthCheck } from "@/hooks";
export const RedirectIfAuth = () => {
    const isAuth = useAuthCheck();
    if (isAuth === null)
        return _jsx(LoadingModal, { loadingMessage: "Verificando..." });
    return isAuth ? _jsx(Navigate, { to: ROUTES.HOME, replace: true }) : _jsx(Outlet, {});
};
