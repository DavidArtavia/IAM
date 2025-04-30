import { useState } from "react";
import { NavLink } from "react-router-dom";
import { SidebarProps } from "@/types/IProps";
import "./Sidebar.css";

export const Sidebar = ({
  logoSrc = "/logo-placeholder.svg",
  logoAlt = "Taller Logo",
  isCollapsed: initialCollapsed = false,
  onToggle,
  menuItems,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) onToggle();
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <NavLink to="/">
          <img src={logoSrc} alt={logoAlt} className="logo" />
        </NavLink>
      </div>

      {/* Toggle Button */}
      <button className="toggle-button" onClick={handleToggle}>
        <span className="material-symbols-outlined">
          {isCollapsed ? "chevron_right" : "chevron_left"}
        </span>
      </button>

      {/* Menu */}
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div key={index} className="menu-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `menu-link ${isActive ? "active" : ""} ${
                  isCollapsed ? "collapsed" : ""
                }`
              }
            >
              <span className="material-symbols-outlined menu-icon">
                {item.icon}
              </span>
              {!isCollapsed && <span className="menu-title">{item.title}</span>}
            </NavLink>

            {/* Submenu (si existe) */}
            {item.subItems && !isCollapsed && (
              <div className="submenu">
                {item.subItems.map((subItem, subIndex) => (
                  <NavLink
                    key={subIndex}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="submenu-bullet"></span>
                    <span className="submenu-title">{subItem.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
