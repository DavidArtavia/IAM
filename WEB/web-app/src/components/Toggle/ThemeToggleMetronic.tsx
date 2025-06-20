import { useEffect, useState } from "react";

/**
 * Toggle oficial de modo oscuro para Metronic.
 * Cambia el atributo 'data-kt-app-theme' y recarga para aplicar los estilos.
 */
export const ThemeToggleMetronic = () => {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-kt-app-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // ✅ Necesario para que Metronic re-aplique las variables CSS
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="form-check form-switch form-check-custom form-check-solid d-flex align-items-center gap-2">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        id="themeSwitch"
        checked={theme === "dark"}
        onChange={handleToggle}
      />
      <label className="form-check-label fw-semibold" htmlFor="themeSwitch">
        Modo Oscuro
      </label>
    </div>
  );
};
