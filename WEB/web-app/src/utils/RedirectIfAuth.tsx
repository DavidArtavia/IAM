// RedirectIfAuth.tsx
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/constants";
import { LoadingModal } from "@/components";
import { useAuthCheck } from "@/hooks";

export const RedirectIfAuth = () => {
  const isAuth = useAuthCheck();

  if (isAuth === null) return <LoadingModal loadingMessage="Verificando..." />;
  return isAuth ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />;
};
