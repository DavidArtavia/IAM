// src/context/AuthContext.tsx
import { createContext, useState, ReactNode } from "react";

// Tipo del usuario, podés ajustarlo según tu backend
interface UserInfo {
  id: number; // can be any hashable type
  name: string;
  email: string;
  // ...otros campos que necesites
}

interface AuthContextType {
  userInfo: UserInfo | null;
  setUserInfo: (user: UserInfo | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  userInfo: null,
  setUserInfo: () => {},
});

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
