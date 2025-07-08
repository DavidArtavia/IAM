import { ROUTES } from "@/constants";
export const logoutUser = () => {
    localStorage.removeItem("accesToken");
    window.location.href = ROUTES.LOGIN;
};
