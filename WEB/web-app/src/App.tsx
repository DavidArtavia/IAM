// App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { AppRouter } from "@/routers/AppRouter";
import { AppProvider } from "./context/AppProvider";
import AuthProvider from "./context/AuthProvider";


export const App = () => {
  return (
    <>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppProvider>
            <AppRouter />
          </AppProvider>
        </AuthProvider>
      </Router>
    </>
  );
};
