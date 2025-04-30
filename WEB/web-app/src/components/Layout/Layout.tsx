import { useState } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { ROUTES } from "@/constants/routes";
import { IProps, MenuItem } from "@/types/IProps";
import "./Layout.css";

export const Layout = ({ children }: IProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: MenuItem[] = [
    {
      title: "Inicio",
      icon: "home",
      path: ROUTES.HOME,
    },
    {
      title: "Iniciar Sesión",
      icon: "lock",
      path: ROUTES.LOGIN,
      subItems: [
        { title: "Iniciar Sesión", path: ROUTES.LOGIN },
        { title: "Cerrar Sesión", path: "/logout" }, // Ruta placeholder
      ],
    },
  ];

  return (
    <div className="layout">
      <Sidebar
        menuItems={menuItems}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />
      <main className={`layout-content ${isCollapsed ? "collapsed" : ""}`}>
        {children}
      </main>
    </div>
  );
};
