// src/components/Modals/GenericFormModal/types.ts
export interface FieldConfig<T> {
  key: keyof T;
  label: string;
  type?: "date" | "text" | "number" | "date" | "boolean"| "textarea";
}
