import React, { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  steps?: number;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
};

export const DecimalInput = ({
  value,
  onChange,
  min = 0,
  max,
  steps = 1000,
  required = false,
  placeholder,
  className,
  disabled = false,
  readOnly = false,

}: Props) => {
  const ref = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState("");

  // Normaliza: quita espacios, convierte coma a punto, elimina duplicados de punto
  const normalize = (s: string) => {
    if (!s) return "";
    let v = s.replace(/\s+/g, "").replace(/,/g, ".");
    v = v.replace(/[^0-9.]/g, "");
    const i = v.indexOf(".");
    if (i >= 0) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, "");
    return v;
  };

  // Formatea para mostrar: miles con espacio, decimales con coma
  const format = (s: string) => {
    if (!s) return "";
    const [intPart, fracPart] = s.split(".");
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return fracPart !== undefined
      ? `${intFormatted},${fracPart}`
      : intFormatted;
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const el = e.currentTarget;    
    const caret = el.selectionStart ?? el.value.length;

    // 👉 aquí sí obtenemos lo que el usuario escribió (incluyendo espacios temporales)
    const normalized = normalize(el.value);

    setRaw(normalized);
    onChange(normalized);

    const newDisplay = format(normalized);

    // Restaurar cursor en la posición correcta
    requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.value = newDisplay;

      // mapear la posición cruda a formateada
      const rawIndex = Math.min(normalized.length, caret);
      let pos = 0,
        seen = 0;
      for (let i = 0; i < newDisplay.length; i++) {
        if (newDisplay[i] !== " ") seen++;
        if (seen >= rawIndex) {
          pos = i + 1;
          break;
        }
      }
      ref.current.setSelectionRange(pos, pos);
    });
  };

  const handleBlur = () => {
    if (!raw) return;
    let num = parseFloat(raw);
    if (!isNaN(num)) {
      if (min !== undefined && num < min) num = min;
      if (max !== undefined && num > max) num = max;
      const normalized = String(num);
      setRaw(normalized);
      onChange(normalized);
    }
  };

  useEffect(() => {
    setRaw(normalize(value));
  }, [value]);

  return (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      step={steps}
      readOnly={readOnly}
      required={required}
      disabled={disabled}
      placeholder={placeholder || "0.00"}
      className={`form-control text-muted form-control-sm ${className || ""}`}
      defaultValue={format(raw)}
      onInput={handleInput}
      onBlur={handleBlur}
    />
  );
};
