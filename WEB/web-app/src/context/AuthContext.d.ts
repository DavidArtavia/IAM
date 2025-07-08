import { DTO_Usuario } from "@/models";
interface AuthContextType {
    user: DTO_Usuario | null;
    token: string | null;
    setUser: (user: DTO_Usuario | null) => void;
    isAuthenticated: boolean;
    login: (user: DTO_Usuario, token: string) => void;
    logout: () => void;
}
export declare const AuthContext: import("react").Context<AuthContextType>;
export {};
