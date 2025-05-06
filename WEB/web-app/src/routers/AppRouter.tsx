import { LayoutMain } from "@/components/Layout/LayoutMain";
import { Statistics } from "@/components/Statistics/Statistics";
import { ROUTES } from "@/constants/routes";
import { Home } from "@/screens/Home/Home";
import { Login } from "@/screens/Login/Login";
import RequireAuth from "@/utils/RequireAuth ";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />

      {/* ✅ Rutas protegidas */}
      <Route element={<RequireAuth />}>
        <Route element={<LayoutMain />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.STATISTICS} element={<Statistics />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};
