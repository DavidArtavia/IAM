import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
// App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { AppRouter } from "@/routers/AppRouter";
import { AppProvider } from "./context/AppProvider";
import AuthProvider from "./context/AuthProvider";
export const App = () => {
    return (_jsx(_Fragment, { children: _jsx(Router, { future: { v7_startTransition: true, v7_relativeSplatPath: true }, children: _jsx(AuthProvider, { children: _jsx(AppProvider, { children: _jsx(AppRouter, {}) }) }) }) }));
};
