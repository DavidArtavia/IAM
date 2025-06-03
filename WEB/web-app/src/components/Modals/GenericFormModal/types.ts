// src/components/Modals/GenericFormModal/types.ts
export interface FieldConfig<T> {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "date" | "boolean"| "textarea";
}
