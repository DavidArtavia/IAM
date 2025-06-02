// src/components/Modals/GenericFormModal/GenericFormModal.tsx
import React, { useState, useEffect } from "react";
import { FieldConfig } from "./types";

interface GenericFormModalProps<T> {
  show: boolean;
  onHide: () => void;
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  onSubmit: () => void;
  /** Array de campos que queremos renderizar + validar */
  fields: Array<FieldConfig<T>>;
}

export const FormModal = <T extends Record<string, unknown>>({
  show,
  onHide,
  data,
  setData,
  onSubmit,
  fields,
}: GenericFormModalProps<T>) => {
  // Errores por cada campo: Partial<Record<keyof T, string>>
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // Inicializar errores a vacío cada vez que abrimos el modal
  useEffect(() => {
    if (show) {
      const emptyErrors: Partial<Record<keyof T, string>> = {};
      fields.forEach((f) => {
        emptyErrors[f.key] = "";
      });
      setErrors(emptyErrors);
    }
  }, [show, fields]);

  // Función que valida un campo en particular y actualiza errors[key]
  const runValidator = (key: keyof T, value: unknown) => {
    const fieldConf = fields.find((f) => f.key === key);
    if (!fieldConf) return "";
    if (fieldConf.validator) {
      const msg = fieldConf.validator(value, data);
      setErrors((prev) => ({ ...prev, [key]: msg }));
      return msg;
    } else {
      // Si no hay validator, consideramos que no hay error
      setErrors((prev) => ({ ...prev, [key]: "" }));
      return "";
    }
  };

  // Handler genérico para cambios en cualquier input
  const handleChange = (key: keyof T, raw: string, type: string) => {
    let newValue: string | number | boolean | Date | null = raw;
    if (type === "number") {
      // Convertimos a número
      const parsed = parseFloat(raw);
      newValue = isNaN(parsed) ? 0 : parsed;
    }
    if (type === "date") {
      // raw ya es texto "yyyy-mm-dd", lo dejamos así
      newValue = raw;
    }

    // Actualizar el data completo
    setData({ ...data, [key]: newValue as T[keyof T] });
    // Ejecutar validación en caliente
    runValidator(key, newValue);
  };

  // Al presionar “Enviar”, verificamos todos los campos:
  const handleSubmit = () => {
    let anyError = false;
    const newErrors: Partial<Record<keyof T, string>> = {};
    fields.forEach((f) => {
      const currentValue = data[f.key];
      const msg = f.validator ? f.validator(currentValue, data) : "";
      newErrors[f.key] = msg;
      if (msg) anyError = true;
    });
    setErrors(newErrors);
    if (!anyError) {
      onSubmit();
    }
  };

  if (!show) return null;

  return (
      <div className="modal fade show d-block shadowBackground"
          onClick={onHide}>
      <div
        className="modal-dialog modal-dialog-centered mw-650px"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">Formulario</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>

          {/* BODY: renderizamos los inputs según fields */}
          <div className="modal-body py-4 px-5">
            {fields.map((field) => {
              const key = field.key;
              const label = field.label;
              const type = field.type ?? "text";
              const rawValue = data[key];

              const errorMsg = errors[key] || "";

              return (
                <div className="mb-3" key={String(key)}>
                  <label className="form-label">{label}</label>

                  {type === "textarea" ? (
                    <textarea
                      className={`form-control ${
                        errorMsg ? "is-invalid" : rawValue ? "is-valid" : ""
                      }`}
                      value={rawValue != null ? String(rawValue) : ""}
                      onChange={(e) =>
                        handleChange(key, e.target.value, "text")
                      }
                    />
                  ) : (
                    <input
                      type={type}
                      className={`form-control ${
                        errorMsg ? "is-invalid" : rawValue ? "is-valid" : ""
                      }`}
                      value={rawValue != null ? String(rawValue) : ""}
                      onChange={(e) => handleChange(key, e.target.value, type)}
                    />
                  )}

                  {errorMsg && (
                    <div className="invalid-feedback">{errorMsg}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FOOTER */}
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
