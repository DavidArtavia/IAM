// RedirectIfAuth.tsx
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { LoadingModal } from "@/components/Modals/LoadingModal/LoadingModal";
import { useAuthCheck } from "@/hooks/useAuthCheck";

const RedirectIfAuth = () => {
  const isAuth = useAuthCheck();

  if (isAuth === null) return <LoadingModal loadingMessage="Verificando..." />;
  return isAuth ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />;
};

export default RedirectIfAuth;
