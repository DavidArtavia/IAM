// src/components/Modals/EditModal/EditModal.tsx
import { useState, useEffect } from "react";

interface EditModalProps<T> {
  show: boolean;
  onHide: () => void;
  data: T | null;
  onSave: (updatedData: T) => void;
  /** Lista de propiedades (keys) del objeto T que quiero que sean editables */
  fieldsToEdit: Array<keyof T>;
  /** Opcional: un mapeo para mostrar etiquetas legibles en lugar de la key cruda */
  labelMap?: Partial<Record<keyof T, string>>;
}

export const EditModal = <T,>({
  show,
  onHide,
  data,
  onSave,
  fieldsToEdit,
  labelMap = {},
}: EditModalProps<T>) => {
  const [formState, setFormState] = useState<T | null>(null);

  useEffect(() => {
    if (data) {
      // clonar el objeto completo para no mutar directo el prop
      setFormState({ ...data });
    }
  }, [data]);

  const handleChange = (key: keyof T, value: unknown) => {
    if (!formState) return;
    setFormState({ ...formState, [key]: value });
  };

  if (!show || !formState) return null;

  return (
    <div
      className="modal fade show d-block shadowBackground"
      onClick={onHide}
    >
      <div
        className="modal-dialog modal-dialog-centered mw-650px"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar Registro</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>

          <div className="modal-body">
            {fieldsToEdit.map((key) => {
              // extraer el valor actual de formState
              const value = formState[key];
              // decidir tipo de input (por simplicidad, todo será text/number)
              const isNumber = typeof value === "number";

              return (
                <div className="mb-3" key={String(key)}>
                  {/* etiqueta personalizada si existe en labelMap, o la misma key */}
                  <label className="form-label">
                    {labelMap[key] ?? String(key)}
                  </label>

                  <input
                    type={isNumber ? "number" : "text"}
                    className="form-control"
                    // si el valor es undefined o null, dejar cadena vacía
                    value={
                      value !== undefined && value !== null ? String(value) : ""
                    }
                    onChange={(e) => {
                      let newValue: string | number = e.target.value;
                      if (isNumber) {
                        // parsear a número solo si es tipo number
                        newValue = parseFloat(newValue);
                        if (isNaN(newValue)) newValue = 0;
                      }
                      handleChange(key, newValue);
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onHide}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (formState) onSave(formState);
              }}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
