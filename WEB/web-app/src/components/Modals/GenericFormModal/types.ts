// src/components/Modals/GenericFormModal/types.ts
export interface FieldOption<V> {
  value: V
  label: string
}

export type FieldType = "date" | "text" | "number" | "date" | "boolean" | "textarea" | "select";

export interface FieldConfig<T, K extends keyof T = keyof T> {
  key: K
  label: string
  type?: FieldType   
  // Si el type es "select", debe venir este array:
  options?: Array<FieldOption<T[K]>>
}