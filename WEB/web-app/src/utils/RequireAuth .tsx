import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "@/api/api";
import { AuthContext } from "@/context/AuthContext";
import { LoadingModal } from "@/components/Modals/LoadingModal/LoadingModal";

const RequireAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const { userInfo, setUserInfo } = useContext(AuthContext);

  useEffect(() => {
    if (userInfo) {
      setIsAuth(true);
      return;
    }

    const sessionUser = sessionStorage.getItem("userInfo");
    if (sessionUser) {
      setUserInfo(JSON.parse(sessionUser));
      setIsAuth(true);
      return;
    }

    // Si no hay usuario, consulta a la API
    checkAuth();
  }, [userInfo, setUserInfo]);

  const checkAuth = async () => {
    try {
      const res = await api.get("/users/profile");
      console.log("Autenticación verificada con API:", res.data);

      if (res.status === 200) {
        setUserInfo(res.data.profile);
        localStorage.setItem("userInfo", JSON.stringify(res.data.profile));
        setIsAuth(true);
      }
    } catch (err) {
      console.log("Error de autenticación:", err);
      setIsAuth(false);
    }
  };

  if (isAuth === null)
    return <LoadingModal loadingMessage="Verificando autenticación..." />;

  return isAuth ? <Outlet /> : <Navigate to="/" replace />;
};

export default RequireAuth;
