// src/hooks/useAuthCheck.ts
import {  useEffect, useState } from "react";

export const useAuthCheck = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accesToken");
      if (!token) {
        setIsAuth(false);
        return;
      }else{
        setIsAuth(true);
      }
    };

    checkAuth();
  }, []);

  return isAuth;
};
