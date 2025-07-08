import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { AuthContext } from "@/context";
const AuthProvider = (props) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const onLogin = (user, token) => {
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
    return (_jsx(AuthContext.Provider, { value: contextValue, children: props.children }));
};
export default AuthProvider;
