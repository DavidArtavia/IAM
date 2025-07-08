import { useState } from "react";
export function useForm(initialFields) {
    const [fields, setFields] = useState(initialFields);
    const handleChange = (name, value) => {
        let fieldValue;
        if (typeof value === "string" || typeof value === "number") {
            fieldValue = String(value);
        }
        else if (value &&
            typeof value === "object" &&
            "target" in value &&
            "value" in value.target) {
            fieldValue = String(value.target.value);
        }
        else {
            fieldValue = "";
        }
        const field = fields[name];
        let error = null;
        if (field.validators) {
            for (const validator of field.validators) {
                error = validator(fieldValue);
                if (error)
                    break;
            }
        }
        setFields((prev) => ({
            ...prev,
            [name]: { ...prev[name], value: fieldValue, error },
        }));
    };
    const validateAll = () => {
        let isValid = true;
        const updatedFields = { ...fields };
        for (const name in updatedFields) {
            const field = updatedFields[name];
            let error = null;
            if (field.validators) {
                for (const validator of field.validators) {
                    error = validator(field.value);
                    if (error)
                        break;
                }
            }
            updatedFields[name] = { ...field, error };
            if (error)
                isValid = false;
        }
        setFields(updatedFields);
        return isValid;
    };
    const getFieldProps = (name) => {
        return {
            value: fields[name]?.value || "",
            onChange: (value) => {
                handleChange(name, value);
            },
            error: fields[name]?.error,
        };
    };
    const setFieldError = (name, error) => {
        setFields((prev) => ({
            ...prev,
            [name]: { ...prev[name], error },
        }));
    };
    return { fields, getFieldProps, validateAll, setFieldError };
}
