// RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants";
import { LoadingModal } from "@/components";
import { useAuthCheck } from "@/hooks";

export const RequireAuth = () => {
  const isAuth = useAuthCheck();
  const { pathname, search } = useLocation();

  const lastPath = pathname + search;
  localStorage.setItem('lastPath', lastPath); 

  if (isAuth === null) return <LoadingModal loadingMessage="Verificando..." />;
  return isAuth ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
};

