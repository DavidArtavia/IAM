// -------------------------------------------------------------------------------------------------
// InfoModal.tsx - Modal genérico para mostrar información detallada.
// Renderiza valores según tipo: fechas, arrays, objetos y primitivos.
// -------------------------------------------------------------------------------------------------
import React from "react";
import { ReferenciaCards } from "@/components/ReferenciasJson/ReferenciasCard";
import { dateHelpers } from "@/utils";

interface InfoModalProps {
  show: boolean;
  onHide: () => void;
  data: Record<string, unknown>;
  labelMap: Record<string, string>;
  title?: string;
}

const tryParseDate = (val: unknown): string | null => {
  if (!val) return null;

  const asDate =
    val instanceof Date
      ? val
      : typeof val === "string" || typeof val === "number"
      ? new Date(val)
      : new Date(NaN);
  if (isNaN(asDate.getTime()) || asDate.getFullYear() < 1753) return null;

  return dateHelpers.formatFechaDDMMYYYY(asDate);
};

const renderValue = (
  key: string,
  value: unknown,
  labelMap: Record<string, string>
): React.ReactNode => {
  // 1) Fecha
  const maybeDate = tryParseDate(value);
  if (maybeDate !== null) return <span>{maybeDate}</span>;
  if (typeof value === "string" && value.startsWith("0001-01-01")) {
    return (
      <span className="badge bg-warning text-dark">No se ha definido aún</span>
    );
  }

  // 2) Array
  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span className="text-muted">[Sin datos]</span>;

    const allNamed = value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "nombre" in item &&
        "valor" in item
    );

    return allNamed ? (
      <ReferenciaCards items={value as any} />
    ) : (
      <pre
        className="bg-light rounded p-2"
        style={{ maxHeight: 200, overflowY: "auto" }}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  // 3) Objeto
  if (typeof value === "object" && value !== null) {
    if ("nombre" in value) {
      const nombre = (value as any).nombre;
      if (nombre === "Activo") {
      return <span className="badge badge-light-success">{nombre}</span>;
      }
      if (nombre === "Eliminado") {
      return <span className="badge badge-light-primary">{nombre}</span>;
      }
      <span className="badge badge-light-info">{nombre}</span>;
    }

    return (
      <div className="row gx-2">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="col-12 d-flex justify-content-between mb-1">
            <strong>{labelMap[k] ?? k}:</strong>
            <span>{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  if (value === undefined || value === null) {
    return <span className="badge bg-secondary">No disponible</span>;
  }
  // 4) Primitivos
  return <span>{String(value)}</span>;
};

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
              className="btn btn-sm btn-icon"
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
                  <div className="d-flex align-items-center">
                    <div className="ms-6">
                      <strong className="fs-5 fw-bold text-dark">
                        {labelMap[key] ?? key}
                      </strong>
                    </div>
                  </div>

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
