// RequireVerified.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context";
import { ROUTES, STATUS_TBL } from "@/constants";

// Requiere: user.ID_Estado === 1 (Activo). Si no, redirige a verificación.
export const RequireVerified = () => {
  const { user } = useContext(AuthContext);

  // Si no hay user, que decida RequireAuth más afuera
  if (!user) return <Outlet />;

  const isVerified = Number(user.estado.iD_Estado) === STATUS_TBL.USER.ACTIVE;
  return isVerified ? <Outlet /> : <Navigate to={ROUTES.VERIFY} replace />;
};
