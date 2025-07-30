// RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants";
import { LoadingModal } from "@/components";
import { useAuthCheck } from "@/hooks";
import { useContext } from "react";
import { AuthContext } from "@/context";

export const RequireAuth = () => {
  const isAuth = useAuthCheck();
  const { user } = useContext(AuthContext);

  const { pathname, search } = useLocation();

  const lastPath = pathname + search;
  if (user) {
    localStorage.setItem(`lastPath:${user.correoUsuario}`, lastPath);
  }

  if (isAuth === null) return <LoadingModal loadingMessage="Verificando..." />;
  return isAuth ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
};
