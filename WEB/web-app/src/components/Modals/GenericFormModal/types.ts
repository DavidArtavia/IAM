// src/components/Modals/GenericFormModal/types.ts
export interface FieldOption<V> {
  value: V
  label: string
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'custom'
  | "boolean";

export interface FieldConfig<T, K extends keyof T = keyof T> {
  key: K
  label: string
  type?: FieldType   
  // Si el type es "select", debe venir este array:
  options?: Array<FieldOption<T[K]>>
   /** Para renderizados especiales */
   renderer?: (props: {
    value: T[K];
    onChange: (newVal: T[K]) => void;
  }) => React.ReactElement;
}