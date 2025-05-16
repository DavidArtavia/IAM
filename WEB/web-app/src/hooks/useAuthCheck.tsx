// src/hooks/useAuthCheck.ts
import { useContext, useEffect, useState } from "react";
import api from "@/api/api";
import { AuthContext } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/constants/apiEndPoints";

export const useAuthCheck = () => {
  const { setUser, logout } = useContext(AuthContext);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accesToken");
      if (!token) {
        setIsAuth(false);
        return;
      }

      try {
        const res = await api.post(
          API_ENDPOINTS.USERS.GET_BY_ID,
          {},
          { skipAuthHandler: true }
        );
        setUser(res.data);
        setIsAuth(true);
      } catch (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: any
      ) {
        console.error("Auth check failed:", error);
        logout();
        setIsAuth(false);
      }
    };

    checkAuth();
  }, [setUser]);

  return isAuth;
};
