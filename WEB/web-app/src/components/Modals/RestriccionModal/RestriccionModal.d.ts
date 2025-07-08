interface RestriccionModalProps {
    show: boolean;
    onClose?: () => void;
    onSave?: () => void;
    modalTitle: string;
    modalTexto: string;
}
export declare const RestriccionModal: ({ show, onClose, onSave, modalTitle, modalTexto, }: RestriccionModalProps) => import("react/jsx-runtime").JSX.Element;
export {};
