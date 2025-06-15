// src/components/Modals/GenericFormModal/types.ts
export interface FieldOption<V> {
  value: V
  label: string
}

// types.ts o donde lo tengas
export type FieldType = "text" | "number" | "select" | "textarea" | "date" | "custom" | "boolean";

export interface FieldConfig<T> {
  key: keyof T;
  label: string;
  type?: FieldType;
  options?: Array<{ value: string | number; label: string }>;
  renderer?: (args: {
    value: any;
    onChange: (val: any) => void;
  }) => React.ReactElement;
  required?: boolean;
  validate?: (value: unknown) => string; // función personalizada
}
