import { ROUTES } from "@/constants/routes";
import { Home } from "@/screens/Home/Home";
import { Login } from "@/screens/Login/Login";
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
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
  );
};
