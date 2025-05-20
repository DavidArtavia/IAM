// src/utils/authHelpers.ts

import { ROUTES } from "@/constants/routes";

export const logoutUser = () => {
    localStorage.removeItem("accesToken");
    window.location.href = ROUTES.LOGIN;
};
