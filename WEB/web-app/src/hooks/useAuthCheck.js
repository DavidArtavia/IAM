// src/hooks/useAuthCheck.ts
import { useEffect, useState } from "react";
//import {api} from "@/api";
//import { AuthContext } from "@/context";
//import { API_ENDPOINTS } from "@/constants";
export const useAuthCheck = () => {
    //const { setUser, logout } = useContext(AuthContext);
    const [isAuth, setIsAuth] = useState(null);
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("accesToken");
            if (!token) {
                setIsAuth(false);
                return;
            }
            else {
                setIsAuth(true);
            }
            // try {
            //   const res = await api.post(
            //     API_ENDPOINTS.USERS.GET_BY_ID,
            //     {},
            //     { skipAuthHandler: true }
            //   );
            //   const user = res.data.resultado[0];
            //   setUser(user);
            //   setIsAuth(true);
            // } catch (
            //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
            //   error: any
            // ) {
            //   console.error("Auth check failed:", error);
            //   logout();
            //   setIsAuth(false);
            // }
        };
        checkAuth();
    }, []);
    return isAuth;
};
