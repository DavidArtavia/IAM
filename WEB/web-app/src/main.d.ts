import './styles.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import "@/assets/plugins/global/plugins.bundle.css";
import "@/assets/css/style.bundle.css";
declare global {
    interface Window {
        $: JQueryStatic;
        jQuery: JQueryStatic;
    }
}
