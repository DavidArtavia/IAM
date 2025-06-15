import { DTO_Param } from "@/models";
import React, { useEffect, useState } from "react";



interface Props {
  value?: DTO_Param[];
  onChange: (val: DTO_Param[]) => void;
}

export const ReferenciasJsonInput = ({ value = [], onChange }: Props) => {
  const [enabled, setEnabled] = useState(value.length > 0);
  const [referencias, setReferencias] = useState<DTO_Param[]>(value);

  useEffect(() => {
    onChange(referencias);
  }, [referencias]);

  const handleAdd = () => {
    if (referencias.length >= 15) {
      alert("No se pueden agregar más de 15 referencias.");
      return;
    }
    setReferencias([...referencias, { nombre: "", valor: "" }]);
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

  const handleToggle = () => {
    setEnabled(!enabled);
    if (!enabled && referencias.length === 0) {
      setReferencias([{ nombre: "", valor: "" }]);
    } else if (enabled) {
      setReferencias([]);
    }
  };

  return (
    <div className="d-flex flex-column">
      <label className="form-check form-check-custom form-check-solid mb-4">
        <input
          type="checkbox"
          className="form-check-input"
          checked={enabled}
          onChange={handleToggle}
        />
        <span className="form-check-label">Referencias</span>
      </label>

      {enabled && (
        <>
          <div className="row g-4 mb-4">
            {referencias.map((ref, idx) => (
              <React.Fragment key={idx}>
                <div className="col-md-6">
                  <input
                    className="form-control form-control-solid"
                    placeholder="Nombre *"
                    value={ref.nombre}
                    onChange={(e) =>
                      handleChange(idx, "nombre", e.target.value)
                    }
                    required
                  />
                </div>
              </React.Fragment>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-outline btn-outline-dashed btn-outline-dark"
            onClick={handleAdd}
            disabled={referencias.length >= 15}
          >
            Nueva referencia
          </button>
        </>
      )}
    </div>
  );
};
