// === 1. Importación necesaria
import { RESTRICCIONES } from "@/constants";
import { DTO_Param as DTO_ParamBase } from "@/models";
import React, { useEffect, useState } from "react";

// Extiende DTO_Param para permitir la propiedad opcional _nuevo
interface DTO_Param extends DTO_ParamBase {
  _nuevo?: boolean;
}

interface Props {
  value?: DTO_Param[];
  onChange: (val: DTO_Param[]) => void;
  hideCheckbox?: boolean; // ⬅️ Permite ocultar el checkbox si se desea
  editable?: boolean; // ⬅️ Permite edición de inputs ya existentes
}

export const ReferenciasJsonInput = ({
  value = [],
  onChange,
  hideCheckbox = false,
  editable = true,
}: Props) => {
  const [enabled, setEnabled] = useState(hideCheckbox || value.length > 0);
  const [referencias, setReferencias] = useState<DTO_Param[]>(value);

  const limiteDeReferencias = referencias.length >= RESTRICCIONES.MAX_REFERENCIAS; // Máximo de referencias permitidas
  useEffect(() => {
    onChange(referencias);
  }, [referencias]);

  const handleAdd = () => {
    if (limiteDeReferencias) return;
    setReferencias([...referencias, { nombre: "", valor: "", _nuevo: true }]);
  };

  const handleChange = (
    index: number,
    campo: "nombre" | "valor",
    nuevoValor: string
  ) => {
    const nuevas = [...referencias];
    nuevas[index][campo] = nuevoValor;
    setReferencias(nuevas);
  };

  const handleDelete = (index: number) => {
    const nuevas = referencias.filter((_, i) => i !== index);
    setReferencias(nuevas);
  };

  const handleToggle = () => {
    const nextState = !enabled;
    setEnabled(nextState);
    if (nextState && referencias.length === 0) {
      setReferencias([{ nombre: "", valor: "", _nuevo: true }]);
    } else if (!nextState) {
      setReferencias([]);
    }
  };

  return (
    <div className="d-flex flex-column">
      {!hideCheckbox && (
        <label className="form-check form-check-custom form-check-solid mb-4">
          <input
            type="checkbox"
            className="form-check-input"
            checked={enabled}
            onChange={handleToggle}
          />
          <span className="form-check-label">Referencias</span>
        </label>
      )}

      {(enabled || hideCheckbox) && (
        <>
          <div className="row g-4 mb-4">
            {referencias.map((ref, idx) => {
              const isEditable = editable || ref._nuevo;
              return (
                <React.Fragment key={idx}>
                  <div className="col-md-6">
                    <div className="position-relative">
                      <input
                        className="form-control form-control-solid pe-10"
                        placeholder="Nombre *"
                        value={ref.nombre}
                        onChange={(e) =>
                          isEditable
                            ? handleChange(idx, "nombre", e.target.value)
                            : undefined
                        }
                        required
                        disabled={!isEditable}
                      />
                      <button
                        type="button"
                        className="btn btn-icon btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
                        onClick={() => handleDelete(idx)}
                        title="Eliminar"
                      >
                        <i
                          className="bi bi-trash"
                          style={{
                            fontSize: "1.2rem",
                            transition: "color 0.2s, font-size 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "red";
                            e.currentTarget.style.fontSize = "1.5rem";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "";
                            e.currentTarget.style.fontSize = "1.2rem";
                          }}
                        ></i>
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          {limiteDeReferencias && (
            <div
              className="alert alert-warning mt-2 py-2 px-3 small"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Límite alcanzado: solo puede crear hasta{" "}
              {RESTRICCIONES.MAX_REFERENCIAS} referencias.
            </div>
          )}
          <button
            type="button"
            className="btn btn-outline btn-outline-dashed btn-outline-dark"
            onClick={handleAdd}
            disabled={limiteDeReferencias}
          >
            {limiteDeReferencias ? "Máximo alcanzado" : "Agregar referencia"}
          </button>
        </>
      )}
    </div>
  );
};
