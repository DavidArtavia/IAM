import { FieldConfig, FieldType } from "@/components";
import { useState, useEffect, useMemo, useCallback } from "react";
type FormState<T> = {
    errors: Record<keyof T, string>;
    touched: Record<keyof T, boolean>;
    localDisplay: Record<keyof T, string>;
};

export function useGenericForm<T>(
    data: T,
    setData: React.Dispatch<React.SetStateAction<T>>,
    fields: FieldConfig<T>[],
    show: boolean,
    onSubmit: () => void
) {
    const [errors, setErrors] = useState<FormState<T>["errors"]>({} as Record<keyof T, string>);
    const [touched, setTouched] = useState<FormState<T>["touched"]>({} as Record<keyof T, boolean>);
    const [localDisplay, setLocalDisplay] = useState<FormState<T>["localDisplay"]>({} as Record<keyof T, string>);
    const emojiRegex = useMemo(() => /[\p{Extended_Pictographic}]/u, []);

    // Inicialización al abrir modal
    useEffect(() => {
        if (!show) return;
        const initErr = {} as Record<keyof T, string>;
        const initTouch = {} as Record<keyof T, boolean>;
        const initDisp = {} as Record<keyof T, string>;

        fields.forEach(({ key, type }) => {
            initErr[key] = "";
            initTouch[key] = false;
            const raw = data[key];
            if (type === "number") initDisp[key] = raw != null ? String(raw) : "";
            else if (type === "date") initDisp[key] = typeof raw === "string" ? raw.slice(0, 10) : "";
        });

        setErrors(initErr);
        setTouched(initTouch);
        setLocalDisplay(initDisp);
    }, [show, fields, data]);

    const validate = useCallback(
        (key: keyof T, value: unknown) => {
            const conf = fields.find(f => f.key === key);
            if (!conf) return "";
            const type = conf.type ?? "text";
            let msg = "";

            if (type === "text" || type === "textarea") {
                const v = String(value ?? "").trim();
                if (!v) msg = "Este campo es obligatorio";
                else if (emojiRegex.test(v)) msg = "No se permiten emoticones";
            } else if (type === "number") {
                const num = parseFloat(String(value ?? ""));
                if (isNaN(num)) msg = "Ingrese un número válido";
                else if (num <= 0) msg = "El valor debe ser mayor que cero";
            }

            setErrors(prev => ({ ...prev, [key]: msg }));
            return msg;
        },
        [fields, emojiRegex]
    );

    const handleChange = useCallback(
        (key: keyof T, raw: string, type: FieldType) => {
            let newVal: unknown = raw;
            if (type === "number") newVal = parseFloat(raw.replace(/,/g, "")) || 0;
            else if (type === "date") newVal = raw;

            setData(prev => ({ ...prev, [key]: newVal } as T));
            if (type === "number" || type === "date") {
                setLocalDisplay(prev => ({ ...prev, [key]: raw }));
            }
        },
        [setData]
    );

    const handleBlur = useCallback(
        (key: keyof T) => {
            setTouched(prev => ({ ...prev, [key]: true }));
            validate(key, data[key]);
        },
        [validate, data]
    );

    const handleSubmitForm = useCallback(() => {
        let hasError = false;
        const newErr = {} as Record<keyof T, string>;
        const newTouch = {} as Record<keyof T, boolean>;

        fields.forEach(f => {
            newTouch[f.key] = true;
            const msg = validate(f.key, data[f.key]);
            newErr[f.key] = msg;
            if (msg) hasError = true;
        });

        setErrors(newErr);
        setTouched(newTouch);
        if (!hasError) onSubmit();
    }, [fields, validate, data, onSubmit]);

    return { errors, touched, localDisplay, handleChange, handleBlur, handleSubmit: handleSubmitForm };
}