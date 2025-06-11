import { ReferenciaCards } from "@/components/ReferenciasJson/ReferenciasJson";
import React from "react";

interface InfoModalProps {
  show: boolean;
  onHide: () => void;
  data: Record<string, unknown>;
  title?: string;
  labelMap: Record<string, string>;
}

export const InfoModal = ({
  show,
  onHide,
  data,
  labelMap,
  title = "Información Detallada",
}: InfoModalProps) => {
  if (!show) return null;

  /**
   * Esta función recibe un value que puede ser:
   * - Un objeto simple (p.ej. { iD_Estado: 4, nombre: "Activo", tabla: "" })
   * - Un arreglo de objetos (p.ej. referenciaJSON: [ { nombre, valor }, ... ] )
   * - Un tipo primitivo (string, number, boolean)
   *
   * Primero detectamos si es un Array (de cualquier tipo).
   *   - Si es un array y cada elemento tiene "nombre" y "valor", lo pintamos como lista.
   *   - Si es un array de otro tipo, lo convertimos a JSON.stringify o lo listamos genéricamente.
   *
   * Luego, si es un objeto normal con clave "nombre", pintamos solo el nombre.
   * Si es un objeto genérico, recorremos keys:values.
   * Finalmente, si no es objeto (p.ej. un string/number), lo mostramos crudo.
   */
  const renderValue = (value: unknown): React.ReactNode => {
    // 1) Si es un array
    if (Array.isArray(value)) {
      // Revisamos si el array está vacío o su primer elemento es un objeto con { nombre, valor }
      if (value.length === 0) {
        return <span className="text-muted">[Sin datos]</span>;
      }
      // Si todos los elementos tienen { nombre, valor }
      const elemetosJsonConNombreValor = (value as undefined[]).every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "nombre" in item &&
          "valor" in item
      );

      if (elemetosJsonConNombreValor) {
        return <ReferenciaCards items={value}/> 
      }

      // Si es un array de otro tipo (p.ej. strings, números u objetos mixtos),
      // lo convertimos a un JSON formateado para legibilidad:
      return (
        <pre
          style={{
            background: "#f6f8fa",
            borderRadius: 8,
            padding: 8,
            fontSize: 14,
            color: "#24292f",
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    // 2) Si es un objeto simple (no array)
    if (typeof value === "object" && value !== null) {
      // Si dentro del objeto hay la clave 'nombre', simplemente mostramos ese nombre
      if ("nombre" in (value as Record<string, unknown>)) {
        return (
          <span className="badge badge-light-success">
            {(value as { nombre: string }).nombre}
          </span>
        );
      }
      // Si es otro objeto genérico, recorremos pares clave:valor
      return (
        <div>
          {Object.entries(value as Record<string, unknown>).map(
            ([key, val]) => (
              <div key={key} className="d-flex justify-content-between mb-1">
                <strong>{labelMap[key] ?? key}:</strong>{" "}
                {typeof val === "object" && val !== null
                  ? JSON.stringify(val) // si el valor es otro objeto, lo stringify‐amos
                  : String(val)}
              </div>
            )
          )}
        </div>
      );
    }

    // 3) Cualquier otro caso: string, number, boolean, null, undefined
    return <span>{String(value)}</span>;
  };

  return (
    <div className="modal fade show d-block shadowBackground" onClick={onHide}>
      <div
        className="modal-dialog modal-dialog-centered mw-650px"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2>{title}</h2>
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-color-primary"
              onClick={onHide}
            >
              ✕
            </button>
          </div>

          <div className="modal-body py-10 px-lg-17">
            <div className="table-responsive">
              {Object.entries(data).map(([key, val]) => (
                <div
                  key={key}
                  className="d-flex flex-stack py-5 border-bottom border-gray-300 border-bottom-dashed"
                >
                  {/* Columna izquierda: etiqueta / label */}
                  <div className="d-flex align-items-center">
                    <div className="ms-6">
                      <a
                        href="#"
                        className="d-flex align-items-center fs-5 fw-bolder text-dark text-hover-primary"
                        style={{ textDecoration: "none" }}
                        tabIndex={-1}
                        onClick={(e) => e.preventDefault()}
                      >
                        <strong>{labelMap[key] ?? key}</strong>
                      </a>
                    </div>
                  </div>

                  {/* Columna derecha: valor (o renderValue) */}
                  <div className="d-flex align-items-center">
                    <div className="ms-6">{renderValue(val)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer flex-center">
            <button type="button" className="btn btn-light" onClick={onHide}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
