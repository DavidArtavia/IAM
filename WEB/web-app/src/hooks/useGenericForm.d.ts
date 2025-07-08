import { FieldConfig, FieldType } from "@/components";
export declare function useGenericForm<T>(data: T, setData: React.Dispatch<React.SetStateAction<T>>, fields: FieldConfig<T>[], show: boolean, onSubmit: () => void): {
    errors: Record<keyof T, string>;
    touched: Record<keyof T, boolean>;
    wasSubmitted: boolean;
    localDisplay: Record<keyof T, string>;
    handleChange: (key: keyof T, raw: string, type: FieldType) => void;
    handleBlur: (key: keyof T) => void;
    handleSubmit: () => void;
    hasErrors: boolean;
};
