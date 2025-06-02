import React, { useState, useEffect } from "react";

interface EditModalProps<T> {
  show: boolean;
  onHide: () => void;
  data: T | null;
  onSave: (updatedData: T) => void;
}

export const EditModal = <T,>({
  show,
  onHide,
  data,
  onSave,
}: EditModalProps<T>) => {
  const [formState, setFormState] = useState<T | null>(null);

  useEffect(() => {
    if (data) setFormState(data);
  }, [data]);

  const handleChange = (key: string, value: unknown) => {
    if (formState) {
      setFormState({ ...formState, [key]: value });
    }
  };

  if (!show || !formState) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onHide}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
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
            {Object.entries(formState).map(([key, value]) =>
              typeof value !== "object" ? (
                <div className="mb-3" key={key}>
                  <label className="form-label">{key}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={value !== undefined && value !== null ? String(value) : ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                </div>
              ) : null
            )}
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
              onClick={() => onSave(formState)}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
