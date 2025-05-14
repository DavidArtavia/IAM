import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutMain } from "@/components/Layout/LayoutMain";
import { Statistics } from "@/components/Statistics/Statistics";
import { ROUTES } from "@/constants/routes";
import { Home } from "@/screens/Home/Home";
import { Login } from "@/screens/Login/Login";
import { SignUp } from "@/screens/SignUp/SignUp";

import RedirectIfAuth from "@/utils/RedirectIfAuth";
import RequireAuth from "@/utils/RequireAuth ";
import ChatAi from "@/components/ChatAi/ChatAi";

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
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.CHAT_AI} element={<ChatAi />} />
          <Route path={ROUTES.STATISTICS} element={<Statistics />} />
        </Route>
      </Route>

      {/* Ruta por defecto si no se encuentra ninguna */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};
