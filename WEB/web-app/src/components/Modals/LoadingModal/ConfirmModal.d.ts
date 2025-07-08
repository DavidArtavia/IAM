interface ConfirmModalProps {
    show: boolean;
    confirmMessage?: string;
    onAction: (action: boolean | null) => void;
}
export declare const ConfirmModal: ({ show, confirmMessage, onAction, }: ConfirmModalProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
