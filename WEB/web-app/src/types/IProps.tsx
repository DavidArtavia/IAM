import React from "react";

export interface IProps {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export interface SidebarProps {
  logoSrc?: string; // Ruta o URL del logo
  logoAlt?: string; // Texto alternativo para el logo
  isCollapsed?: boolean; // Estado para colapsar/expandir
  onToggle?: () => void; // Función para alternar colapsado/expandido
  menuItems: MenuItem[]; // Lista de ítems del menú
}

export interface MenuItem {
  title: string; // Título del ítem (ej. "Inicio")
  icon: string; // Nombre del ícono (para Material Symbols)
  path: string; // Ruta para navegación (ej. "/home")
  subItems?: SubMenuItem[]; // Submenú opcional
}

export interface SubMenuItem {
  title: string; // Título del subítem (ej. "Sign-in")
  path: string; // Ruta para navegación
}
