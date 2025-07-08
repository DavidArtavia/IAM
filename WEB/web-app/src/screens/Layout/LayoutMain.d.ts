import "./LayoutMain.css";
declare global {
    interface Window {
        KTDrawer: {
            createInstances: () => void;
        };
        KTMenu: {
            createInstances: () => void;
        };
        KTScroll: {
            createInstances: () => void;
        };
    }
}
export declare const LayoutMain: () => import("react/jsx-runtime").JSX.Element;
