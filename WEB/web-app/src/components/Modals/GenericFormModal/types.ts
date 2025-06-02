export interface FieldConfig<T> {
    key: keyof T;
    label: string;
    type?: "text" | "number" | "date" | "textarea";
    validator?: (value: unknown, allData: T) => string;
  }