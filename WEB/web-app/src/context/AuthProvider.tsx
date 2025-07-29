import { ReactNode, useEffect, useState } from "react";
import { AuthContext } from "@/context";
import { DTO_Usuario } from "@/models";

type Props = {
  children: ReactNode;
};

const AuthProvider = (props: Props) => {
  const [user, setUser] = useState<DTO_Usuario | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as DTO_Usuario;
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user from sessionStorage:", error);
        sessionStorage.removeItem("auth_user");
      }
    }
  }, []);

  const login = (user: DTO_Usuario) => {
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("auth_user", JSON.stringify(user)); // Persistir en localStorage
  };

  const contextValue = {
    user,
    setUser,
    isAuthenticated,
    login,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
