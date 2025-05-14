// src/utils/RedirectIfAuth.tsx
import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "@/context/AuthContext";
import { LoadingModal } from "@/components/Modals/LoadingModal/LoadingModal";
import { ROUTES } from "@/constants/routes";

const RedirectIfAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const { setUser } = useContext(AuthContext);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = localStorage.getItem("user");
        if (user) {
          setUser(JSON.parse(user));
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    return <LoadingModal loadingMessage="Verificando autenticación..." />;
  }

  return isAuth ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />;
};

export default RedirectIfAuth;
