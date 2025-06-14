// -------------------------------------------------------------------------------------------------
// InfoModal.tsx - Generic component to display detailed information in a modal,
//                with automatic date detection, arrays, objects, and primitives,
//                using Bootstrap for styling.
// -------------------------------------------------------------------------------------------------
import React from "react";
import { ReferenciaCards } from "@/components/ReferenciasJson/ReferenciasJson";
import { dateHelpers } from "@/utils";

// -----------------------------------
// Types & Interfaces
// -----------------------------------
interface InfoModalProps {
  show: boolean;
  onHide: () => void;
  data: Record<string, unknown>;
  labelMap: Record<string, string>;
  title?: string;
}

// -----------------------------------
// Helper Functions
// -----------------------------------
/**
 * Attempts to parse any value as a Date if it looks date-like,
 * and returns formatted dd/MM/yyyy. Otherwise returns null.
 */
const tryParseDate = (val: unknown): string | null => {
  if (val == null) return null;

  // If value is a Date instance
  if (val instanceof Date) {
    if (isNaN(val.getTime()) || val.getFullYear() < 1753) return null;
    return dateHelpers.formatFechaDDMMYYYY(val);
  }

  // If value is a string that resembles an ISO date
  const str = String(val);
  const isoLike = /^\d{4}-\d{2}-\d{2}(T|$)/.test(str);
  if (!isoLike) return null;

  const date = new Date(str);
  if (isNaN(date.getTime()) || date.getFullYear() < 1753) return null;
  return dateHelpers.formatFechaDDMMYYYY(date);
};

// -----------------------------------
// Value Renderer
// -----------------------------------
/**
 * Renders a value based on its type:
 *  - Detected date: formatted dd/MM/yyyy or 'No se ha definido aún'
 *  - Array: ReferenciaCards or JSON
 *  - Object: badge or key/value list
 *  - Primitive: string
 */
const renderValue = (
  key: string,
  value: unknown,
  labelMap: Record<string, string>
): React.ReactNode => {
  // 1) Automatic date detection for Date or ISO-like strings
  let isDateCandidate = false;
  let formattedDate: string | null = null;

  if (value instanceof Date) {
    isDateCandidate = true;
    formattedDate = tryParseDate(value);
  } else if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}(T|$)/.test(String(value))
  ) {
    isDateCandidate = true;
    formattedDate = tryParseDate(value);
  }

  if (isDateCandidate) {
    if (formattedDate) {
      return <span>{formattedDate}</span>;
    }
    return (
      <span className="badge bg-warning text-dark">No se ha definido aún</span>
    );
  }

  // 2) Array handling
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted">[Sin datos]</span>;
    }

    const allNamed = (value as unknown[]).every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "nombre" in item &&
        "valor" in item
    );

    if (allNamed) {
      return <ReferenciaCards items={value as any} />;
    }

    return (
      <pre
        className="bg-light rounded p-2"
        style={{ maxHeight: 200, overflowY: "auto" }}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  // 3) Object handling
  if (typeof value === "object" && value !== null) {
    if ("nombre" in (value as Record<string, unknown>)) {
      return <span className="badge bg-success">{(value as any).nombre}</span>;
    }
    return (
      <div className="row gx-2">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="col-12 d-flex justify-content-between mb-1">
            <strong>{labelMap[k] ?? k}:</strong>
            <span>{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  // 4) Primitive types
  return <span>{String(value)}</span>;
};

// -----------------------------------
// Component
// -----------------------------------
export const InfoModal: React.FC<InfoModalProps> = ({
  show,
  onHide,
  data,
  labelMap,
  title = "Información Detallada",
}) => {
  if (!show) return null;

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
                    <div className="ms-6">
                      {renderValue(key, val, labelMap)}
                    </div>
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
