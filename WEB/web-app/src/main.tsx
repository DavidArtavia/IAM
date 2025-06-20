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
const root = createRoot(rootElement!);
root.render(
  // <StrictMode>
    <App />
  // </StrictMode>
);
