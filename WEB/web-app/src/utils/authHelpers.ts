
import { ROUTES } from "@/constants";

export const logoutUser = () => {
    localStorage.removeItem("accesToken");
    localStorage.removeItem("auth_user");
    window.location.href = ROUTES.LOGIN;
};
