import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from '@/App';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import "@/assets/plugins/global/plugins.bundle.css";
import "@/assets/css/style.bundle.css";
import $ from 'jquery';
//import { StrictMode } from 'react';

// Extiende el objeto Window
declare global {
    interface Window {
        $: JQueryStatic;
        jQuery: JQueryStatic;
    }
}

// Importa jQuery y asigna globalmente
window.$ = $;
window.jQuery = $;

const rootElement = document.getElementById('root');
// 💡 Establecer el tema sin causar recarga infinita
const storedTheme = localStorage.getItem("theme");

if (!storedTheme) {
  // Si no hay tema guardado, setear uno por defecto (light)
  localStorage.setItem("theme", "light");
  document.documentElement.setAttribute("data-kt-app-theme", "light");
} else {
  // Si ya existe, simplemente aplicarlo (sin reload)
  document.documentElement.setAttribute("data-kt-app-theme", storedTheme);
}

const root = createRoot(rootElement!);
root.render(
  // <StrictMode>
    <App />
  // </StrictMode>
);
