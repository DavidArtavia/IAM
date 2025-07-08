import { FieldConfig } from "./types";
interface GenericFormModalProps<T> {
    title: string;
    show: boolean;
    onHide: () => void;
    data: T;
    setData: React.Dispatch<React.SetStateAction<T>>;
    onSubmit: () => void;
    fields: Array<FieldConfig<T>>;
}
/**
 * Modal genérico para creación/edición de entidades.
 * Soporta:
 * - type="custom"   → renderer personalizado
 * - type="textarea"
 * - type="select"
 * - type="date"     → lógico: vacío si no hay fecha válida
 * - type="number"
 * - type="text"
 */
export declare const GenericFormModal: <T>({ title, show, onHide, data, setData, onSubmit, fields, }: GenericFormModalProps<T>) => import("react/jsx-runtime").JSX.Element | null;
export {};
