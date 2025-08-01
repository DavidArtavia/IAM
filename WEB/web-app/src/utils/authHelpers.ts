
import { ROUTES } from "@/constants";
import { useApp } from "@/hooks/useApp";

export const useLogoutUser = () => {
    const { setNegocio, setListaNegocios } = useApp();

    return () => {
        localStorage.removeItem("accesToken");
        localStorage.removeItem("auth_user");
        setNegocio(null);
        setListaNegocios([]);
        window.location.href = ROUTES.LOGIN;
    };
};
