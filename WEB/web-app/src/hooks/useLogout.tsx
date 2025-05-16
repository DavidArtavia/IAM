import { useContext } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../api/api";
import { AuthContext } from "@/context/AuthContext";
import { ROUTES } from "@/constants/routes";
import { useNotificationContext } from "@/context/NotificationContext";

export const useLogout = () => {
  const { setUser } = useContext(AuthContext);
  const { notify } = useNotificationContext();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Llamada opcional para destruir sesión en el backend
      //await api.post("/auth/logout"); // Cambia esto según tu endpoint

      localStorage.removeItem("accesToken");
      // Limpia contexto
      setUser(null);

      // Redirige a login
      navigate(ROUTES.LOGIN, { replace: true });

      notify.success({
        message: "Sesión cerrada",
        description: "Se cerró la sesión correctamente",
        placement: "bottomRight",
      });
    } catch (error) {
      notify.error({
        message: "Error al cerrar sesión",
        description:
          error instanceof Error ? error.message : "Error inesperado",
        placement: "bottomRight",
      });
    }
  };

  return logout;
};
