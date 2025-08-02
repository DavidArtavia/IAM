import { useContext } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../api/api";
import { AuthContext } from "@/context";
import { ROUTES } from "@/constants";
import { notificationHelpers } from "@/utils";
import { useApp } from "./useApp";

export const useLogout = () => {
  const { setUser } = useContext(AuthContext);
    const { setNegocio, setListaNegocios } = useApp();
  
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Llamada opcional para destruir sesión en el backend
      //await api.post("/auth/logout"); // Cambia esto según tu endpoint

      localStorage.removeItem("accesToken");
      localStorage.removeItem("auth_user");
      // Limpia contexto
      setUser(null);
      setNegocio(null);
      setListaNegocios([]);

      // Redirige a login
      navigate(ROUTES.LOGIN, { replace: true });
      notificationHelpers.successAlert("Se cerró la sesión correctamente.");
    } catch (error) {
      console.log(error);
      notificationHelpers.errorAlert("Error al cerrar sesión.");
    }
  };

  return logout;
};
