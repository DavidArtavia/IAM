import { useState } from "react";

type Validator = (value: string) => string | null;

interface Field {
    value: string;
    error: string | null;
    validators?: Validator[];
}

type Fields = Record<string, Field>;

export function useForm(initialFields: Fields) {
    const [fields, setFields] = useState<Fields>(initialFields);

    const handleChange = (name: string, value: string | number | { target: { value: string | number } }) => {
        let fieldValue: string;
        if (typeof value === "string" || typeof value === "number") {
            fieldValue = String(value);
        } else if (
            value &&
            typeof value === "object" &&
            "target" in value &&
            "value" in value.target
        ) {
            fieldValue = String(value.target.value);
        } else {
            fieldValue = "";
        }

        const field = fields[name];
        let error: string | null = null;

        if (field.validators) {
            for (const validator of field.validators) {
                error = validator(fieldValue);
                if (error) break;
            }
        }

        setFields((prev) => ({
            ...prev,
            [name]: { ...prev[name], value: fieldValue, error },
        }));
    };

    const validateAll = (): boolean => {
        let isValid = true;
        const updatedFields: Fields = { ...fields };

        for (const name in updatedFields) {
            const field = updatedFields[name];
            let error: string | null = null;

            if (field.validators) {
                for (const validator of field.validators) {
                    error = validator(field.value);
                    if (error) break;
                }
            }

            updatedFields[name] = { ...field, error };
            if (error) isValid = false;
        }

        setFields(updatedFields);
        return isValid;
    };

    const getFieldProps = (name: string) => {
        return {
            value: fields[name]?.value || "",
            onChange: (value: string | number | { target: { value: string | number } }) => {
                handleChange(name, value);
            },
            error: fields[name]?.error,
        };
    };

    const setFieldError = (name: string, error: string | null) => {
        setFields((prev) => ({
            ...prev,
            [name]: { ...prev[name], error },
        }));
    };

    return { fields, getFieldProps, validateAll, setFieldError };
}