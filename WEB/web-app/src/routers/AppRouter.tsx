import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { Home, LayoutMain } from "@/screens";
import { Login, SignUp } from "@/auth";
import { ChatAi } from "@/components";
import { RedirectIfAuth, RequireAuth } from "@/utils";
export const AppRouter = () => {
  return (
    <Routes>
      {/* Redirige raíz a login */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

      {/* Rutas públicas con protección para usuarios ya autenticados */}
      <Route element={<RedirectIfAuth />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<SignUp />} />
      </Route>

      {/* Rutas privadas (requieren autenticación) */}
      <Route element={<RequireAuth />}>
        <Route element={<LayoutMain />}>
          <Route path={ROUTES.CHAT_AI} element={<ChatAi />} />
          <Route path={ROUTES.HOME} element={<Home />} />
        </Route>
      </Route>

      {/* Ruta por defecto si no se encuentra ninguna */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};
