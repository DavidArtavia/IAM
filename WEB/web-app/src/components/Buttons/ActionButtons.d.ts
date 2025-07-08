interface ActionButtonsProps<T = unknown> {
    rowData: T;
    showItemsButton?: boolean;
    onEdit: (row: T) => void;
    onDelete: (row: T) => void;
    onOpenModal?: (row: T) => void;
}
export declare const ActionButtons: ({ rowData, onEdit, onDelete, onOpenModal, showItemsButton, }: ActionButtonsProps) => import("react/jsx-runtime").JSX.Element;
export {};
