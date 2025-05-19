// RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { LoadingModal } from "@/components/Modals/LoadingModal/LoadingModal";
import { useAuthCheck } from "@/hooks/useAuthCheck";

const RequireAuth = () => {
  const isAuth = useAuthCheck();
  const { pathname, search } = useLocation();

  const lastPath = pathname + search;
  localStorage.setItem('lastPath', lastPath); 

  if (isAuth === null) return <LoadingModal loadingMessage="Verificando..." />;
  return isAuth ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
};

export default RequireAuth;
