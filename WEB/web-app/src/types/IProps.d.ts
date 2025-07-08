import React from "react";
export interface IProps {
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
}
export interface SidebarProps {
    logoSrc?: string;
    logoAlt?: string;
    isCollapsed?: boolean;
    onToggle?: () => void;
    menuItems: MenuItem[];
}
export interface MenuItem {
    title: string;
    icon: string;
    path: string;
    subItems?: SubMenuItem[];
}
export interface SubMenuItem {
    title: string;
    path: string;
}
