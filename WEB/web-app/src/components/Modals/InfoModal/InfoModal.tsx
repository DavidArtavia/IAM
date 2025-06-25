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
  dateKeys?: string[]; // ⬅️ Lista de claves que deben ser tratadas como fecha
}

/**
 * Intenta formatear un valor como fecha si es válido y superior a 1753.
 */
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

/**
 * Renderiza un valor según su tipo (string, objeto, array, fecha, primitivo)
 */
const renderValue = (
  key: string,
  value: unknown,
  labelMap: Record<string, string>,
  dateKeys?: string[]
): React.ReactNode => {
  // 1) Fechas
  if (dateKeys?.includes(key)) {
    const maybeDate = tryParseDate(value);
    if (maybeDate !== null) return <span>{maybeDate}</span>;

    if (typeof value === "string" && value.startsWith("0001-01-01")) {
      return (
        <span className="badge bg-warning text-dark">
          No se ha definido aún
        </span>
      );
    }
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
      const nombre = String((value as any).nombre).toLowerCase();

      const badgeMap: Record<string, string> = {
        activo: "badge-light-success",
        nuevo: "badge badge-secondary",
        "en proceso": "badge-light-primary",
        "en espera": "badge-light-warning",
        completado: "badge-light-success",
        eliminado: "badge-light-danger",
        inactivo: "badge-light-light",
        default: "badge badge-dark",
      };

      const badgeClass = badgeMap[nombre] ?? badgeMap.default;

      return <span className={badgeClass}>{(value as any).nombre}</span>;
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

  // 4) Valores nulos o indefinidos
  if (value === undefined || value === null) {
    return <span className="badge bg-secondary">No disponible</span>;
  }

  // 5) Primitivos
  return <span>{String(value)}</span>;
};

/**
 * Componente modal reutilizable para mostrar información detallada de un objeto.
 */
export const InfoModal: React.FC<InfoModalProps> = ({
  show,
  onHide,
  data,
  labelMap,
  title = "Información Detallada",
  dateKeys = [], // ⬅️ Se asegura valor por defecto
}) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block shadowDarkBackground"
      onClick={onHide}
    >
      <div
        className="modal-dialog modal-dialog-centered mw-650px"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* Título */}
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

          {/* Contenido */}
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
                      {renderValue(key, val, labelMap, dateKeys)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
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
