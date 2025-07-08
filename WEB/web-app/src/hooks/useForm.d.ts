type Validator = (value: string) => string | null;
interface Field {
    value: string;
    error: string | null;
    validators?: Validator[];
}
type Fields = Record<string, Field>;
export declare function useForm(initialFields: Fields): {
    fields: Fields;
    getFieldProps: (name: string) => {
        value: string;
        onChange: (value: string | number | {
            target: {
                value: string | number;
            };
        }) => void;
        error: string | null;
    };
    validateAll: () => boolean;
    setFieldError: (name: string, error: string | null) => void;
};
export {};
