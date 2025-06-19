interface ItemsOrdenDeServicioModalProps {
    open: boolean;
    onHide: () => void;
    title?: string;
    rowData: Record<string, any>;
}

export const ItemsOrdenDeServicioModal = ({
  open,
  onHide,
  title = "Detalle del Ítem",
  rowData,
}: ItemsOrdenDeServicioModalProps) => {
  if (!open) return null;

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
            <div className="row mb-5">
              {rowData ? (
                Object.entries(rowData).map(([key, value]) => (
                  <div className="mb-3 col-12" key={key}>
                    <strong>{key}:</strong> <span>{String(value)}</span>
                  </div>
                ))
              ) : (
                <div>No hay datos para mostrar.</div>
              )}
            </div>
          </div>
          <div className="modal-footer flex-center">
            <button
              type="button"
              className="btn btn-light me-3"
              onClick={onHide}
            >
              Descartar
            </button>
            <button type="button" className="btn btn-primary" onClick={onHide}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};