// src/components/Modals/GenericFormModal/FormModal.tsx
import React, { useState, useEffect } from "react";
import { FieldConfig } from "./types";

interface GenericFormModalProps<T> {
  title: string;
  show: boolean;
  onHide: () => void;
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  onSubmit: () => void;
  /** Array de campos que queremos renderizar + validar */
  fields: Array<FieldConfig<T>>;
}

export const GenericFormModal = <T,>({
  title,
  show,
  onHide,
  data,
  setData,
  onSubmit,
  fields,
}: GenericFormModalProps<T>) => {
  // 1) Errores para cada campo: Partial<Record<keyof T, string>>
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // 2) touched[key] = true si el usuario ya hizo blur por ese campo
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  // 3) Para mostrar el “raw” en inputs de tipo number o date
  const [localDisplay, setLocalDisplay] = useState<
    Partial<Record<keyof T, string>>
  >({});

  // Expresión regular para detectar EMOJIs (Extended Pictographic)
  const EmojiRegex = /[\p{Extended_Pictographic}]/u;

  // ------------------------------------------------------------
  // Cada vez que abrimos el modal, inicializamos errores / touched / localDisplay
  // ------------------------------------------------------------
  useEffect(() => {
    if (!show) return;

    const emptyErrors: Partial<Record<keyof T, string>> = {};
    const emptyTouched: Partial<Record<keyof T, boolean>> = {};
    const initialDisplay: Partial<Record<keyof T, string>> = {};

    fields.forEach((f) => {
      emptyErrors[f.key] = "";
      emptyTouched[f.key] = false;

      // Si el campo es number o date, preparamos su “display” inicial
      const raw = data[f.key];
      if (f.type === "number") {
        initialDisplay[f.key] = raw != null ? String(raw) : "";
      } else if (f.type === "date") {
        // Suponemos que raw es string “yyyy-mm-dd” o Date guardado como string
        initialDisplay[f.key] = typeof raw === "string" ? raw.slice(0, 10) : "";
      }
    });

    setErrors(emptyErrors);
    setTouched(emptyTouched);
    setLocalDisplay(initialDisplay);
  }, [show, data, fields]);

  // ------------------------------------------------------------
  // runValidator: recibe una key y su valor “value” y devuelve mensaje de error.
  // ------------------------------------------------------------
  const runValidator = (key: keyof T, value: unknown): string => {
    // 1) Buscamos la configuración de este campo
    const conf = fields.find((f) => f.key === key);
    if (!conf) return "";

    const type = conf.type ?? "text";
    let msg = "";

    // 2) Dependiendo del tipo, aplicamos la validación “por defecto”
    if (type === "text" || type === "textarea") {
      // obligatorio + no emojis
      const v = String(value ?? "").trim();
      if (!v) {
        msg = "Este campo es obligatorio";
      } else if (EmojiRegex.test(v)) {
        msg = "No se permiten emoticones";
      }
    } else if (type === "number") {
      // debe ser parseable y > 0
      const parsed = parseFloat(String(value ?? ""));
      if (isNaN(parsed)) {
        msg = "Ingrese un número válido";
      } else if (parsed <= 0) {
        msg = "El valor debe ser mayor que cero";
      }
    } else {
      // type === "date" (o cualquier otro): no validamos por defecto
      msg = "";
    }

    setErrors((prev) => ({ ...prev, [key]: msg }));
    return msg;
  };

  // ------------------------------------------------------------
  // handleChange: actualiza “data[key]” (conversión según type)
  // ------------------------------------------------------------
  const handleChange = (
    key: keyof T,
    raw: string,
    type: "text" | "number" | "date" | "textarea"
  ) => {
    let newValue: unknown = raw;

    if (type === "number") {
      // Convertir a número
      const parsed = parseFloat(raw.replace(/,/g, ""));
      newValue = isNaN(parsed) ? 0 : parsed;
    } else if (type === "date") {
      newValue = raw; // esperamos "yyyy-mm-dd"
    } else {
      // "text" o "textarea": simple string
      newValue = raw;
    }

    // 1) Actualizar el objeto completo
    setData({ ...data, [key]: newValue } as T);

    // 2) Si es number/date, actualizar display “raw”
    if (type === "number" || type === "date") {
      setLocalDisplay((prev) => ({ ...prev, [key]: raw }));
    }

    // >>> NO corremos runValidator aquí; validamos al hacer blur o submit
  };

  // ------------------------------------------------------------
  // handleBlur: marca touched[key] = true y corre validación en ese campo
  // ------------------------------------------------------------
  const handleBlur = (key: keyof T) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    runValidator(key, data[key]);
  };

  // ------------------------------------------------------------
  // handleSubmit: valida todos los campos y, si todo está OK, llama onSubmit()
  // ------------------------------------------------------------
  const handleSubmit = () => {
    let anyError = false;
    const newErrors: Partial<Record<keyof T, string>> = {};
    const newTouched: Partial<Record<keyof T, boolean>> = {};

    fields.forEach((f) => {
      const v = data[f.key];
      const msg = runValidator(f.key, v);
      newErrors[f.key] = msg;
      newTouched[f.key] = true;
      if (msg) anyError = true;
    });

    setErrors(newErrors);
    setTouched(newTouched);

    if (!anyError) {
      onSubmit();
    }
  };

  // ------------------------------------------------------------
  // Si no debe mostrarse el modal, devolvemos null:
  // ------------------------------------------------------------
  if (!show) return null;

  // ------------------------------------------------------------
  // Render del Modal
  // ------------------------------------------------------------
  return (
    <div className="modal fade show d-block shadowBackground" onClick={onHide}>
      <div
        className="modal-dialog modal-dialog-centered mw-650px"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* ================= HEADER ================= */}
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onHide} />
          </div>

          {/* ================= BODY: recorremos los campos ================= */}
          <div className="modal-body py-4 px-5">
            {fields.map((field) => {
              const key = field.key;
              const label = field.label;
              const type = field.type ?? "text";

              // 1) Obtenemos el valor “raw” para el input
              const rawData = data[key];
              const displayValue =
                type === "number" || type === "date"
                  ? localDisplay[key] ?? ""
                  : rawData != null
                  ? String(rawData)
                  : "";

              // 2) ¿Debemos mostrar el mensaje de error?
              const hasTouched = touched[key] === true;
              const errorMsg = hasTouched ? errors[key] || "" : "";

              // 3) Calculamos la clase CSS de Bootstrap
              let inputClass = "form-control";
              if (errorMsg) {
                inputClass = "form-control is-invalid";
              } else if (hasTouched && displayValue !== "") {
                inputClass = "form-control is-valid";
              }

              return (
                <div className="mb-3" key={String(key)}>
                  <label className="form-label">{label}</label>

                  {type === "textarea" ? (
                    <textarea
                      className={inputClass}
                      value={displayValue}
                      onChange={(e) =>
                        handleChange(key, e.target.value, "textarea")
                      }
                      onBlur={() => handleBlur(key)}
                    />
                  ) : (
                    <input
                      type={type}
                      className={inputClass}
                      value={displayValue}
                      onChange={(e) =>
                        handleChange(
                          key,
                          e.target.value,
                          type === "text" ||
                            type === "number" ||
                            type === "date"
                            ? type
                            : "text"
                        )
                      }
                      onBlur={() => handleBlur(key)}
                    />
                  )}

                  {errorMsg && (
                    <div className="invalid-feedback">{errorMsg}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ================= FOOTER ================= */}
          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={onHide}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
