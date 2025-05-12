import { ReactNode, useReducer } from "react";
import { AuthContext } from "./AuthContext";
import { authReducer, AuthState } from "./authReducer";
import { types } from "@/types/types";
import { DTO_Usuario } from "@/models/DTO_Usuario";

type Props = {
  children: ReactNode;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const AuthProvider = (props: Props) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  const onLogin = (user: DTO_Usuario, token: string) => {
    const action = {
      type: types.login,
      payload: {
        user,
        token,
      },
    };
    dispatch(action);
  };

  const onLogout = () => {
    const action = {
      type: types.logout,
    };
    dispatch(action);
  };

  // Solución con type assertion para asegurar compatibilidad
  const contextValue = {
    ...authState,
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
