import { ReactNode, useState } from "react";
import { AuthContext } from "./AuthContext";
import { DTO_Usuario } from "@/models/DTO_Usuario";

type Props = {
  children: ReactNode;
};

const AuthProvider = (props: Props) => {
    const [user, setUser] = useState<DTO_Usuario | null>(null);
    const [token, setToken] = useState<string>("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

  const onLogin = (user: DTO_Usuario, token: string) => {

    setUser(user);
    setToken(token);
    setIsAuthenticated(true);
  };

  const onLogout = () => {

    setUser(null);
    setToken('');
    setIsAuthenticated(false);
  };

  // Solución con type assertion para asegurar compatibilidad
  const contextValue = {
    user,
    setUser,
    token,
    isAuthenticated,
    login: onLogin,
    logout: onLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
