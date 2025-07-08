import React from "react";
import "datatables.net-bs5";
import 'datatables.net-buttons/js/buttons.html5.js';
export interface GenericDataTableProps<T> {
    title: string;
    columnKeys: (keyof T)[];
    labelMap: Record<string, string>;
    data: T[];
    onAdd: () => void;
    onEdit: (rowData: T) => void;
    onDelete: (rowData: T) => void;
    onOpenItemsModal?: (rowData: T) => void;
    disableButtonAdd?: boolean;
    customRenderers?: Partial<{
        [K in keyof T]: (value: unknown, rowData: T) => React.ReactNode;
    }>;
    includeEstadoColumn?: boolean;
    includeReferenceColumn?: boolean;
    modalInfoFields?: (keyof T)[];
    showItemsButton?: boolean;
    datekeys?: string[];
}
export declare function GenericDataTable<T>({ title, columnKeys, labelMap, data, onAdd, onEdit, onDelete, onOpenItemsModal, disableButtonAdd, customRenderers, includeEstadoColumn, includeReferenceColumn, modalInfoFields, showItemsButton, datekeys, }: GenericDataTableProps<T>): import("react/jsx-runtime").JSX.Element;
