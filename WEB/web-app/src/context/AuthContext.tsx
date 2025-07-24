import { createContext } from "react";
import { DTO_Usuario } from "@/models";

interface AuthContextType {
  user: DTO_Usuario | null;
  setUser: (user: DTO_Usuario | null) => void;
  isAuthenticated: boolean;
  login: (user: DTO_Usuario) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  login: () => {},
});
