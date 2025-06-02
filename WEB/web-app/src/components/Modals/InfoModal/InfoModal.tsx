import React from "react";

interface InfoModalProps {
  show: boolean;
  onHide: () => void;

  /**
   * Objeto con los datos que queremos mostrar.
   * Ej: { id: 5, nombre: "María", saldo: 1200, ... }
   */
  data: Record<string, unknown>;

  /**
   * Mapa de etiquetas para cada propiedad de `data`.
   * Ej: { id: "ID", nombre: "Nombre completo", saldo: "Saldo (₡)" }
   */
  labels: Record<string, string>;

  /**
   * (Opcional) Lista de keys en el orden deseado.
   * Si no se provee, usará Object.keys(data).
   */
  fieldOrder?: string[];

  /** Título que aparecerá en el header del modal */
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

  const renderValue = (value: unknown): React.ReactNode => {
    if (typeof value === "object" && value !== null) {
      if ("nombre" in value) {
        // Si el objeto tiene la propiedad 'nombre', solo mostrarla
        // @ts-expect-error: sabemos que puede tener 'nombre'
        return <span>{value.nombre}</span>;
      }
      // Si es un objeto, mostrar sus propiedades clave:valor
      return (
        <span>
          {Object.entries(value).map(([key, val], idx, arr) => (
            <span key={key}>
              <strong>{labelMap[key] ?? key}:</strong> {String(val)}
              {idx < arr.length - 1 ? ", " : ""}
            </span>
          ))}
        </span>
      );
    }
    return <span>{String(value)}</span>;
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.20)" }}
      onClick={onHide}
    >
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
                        {/* Puedes personalizar el badge o quitarlo si no aplica */}
                        {/* <span className="badge badge-light fs-8 fw-bold ms-2">
                          Art Director
                        </span> */}
                      </a>
                      {/* Puedes personalizar este campo o quitarlo si no aplica */}
                      {/* <div className="fw-bold text-muted">
                        e.smith@kpmg.com.au
                      </div> */}
                    </div>
                  </div>
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
