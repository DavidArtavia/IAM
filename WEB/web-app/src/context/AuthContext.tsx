import { createContext } from "react";
import { DTO_Usuario } from "@/models/DTO_Usuario";

interface AuthContextType {
  user: DTO_Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: DTO_Usuario, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});
