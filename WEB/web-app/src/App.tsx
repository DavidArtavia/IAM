// App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { AppRouter } from "@/routers/AppRouter";

export const App = () => {
  return (
    <>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRouter />
      </Router>
    </>
  );
};
