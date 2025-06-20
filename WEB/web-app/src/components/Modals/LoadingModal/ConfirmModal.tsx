interface ConfirmModalProps {
  show: boolean;
  confirmMessage?: string;
  onAction: (action: boolean | null) => void;
}

export const ConfirmModal = ({
  show,
  confirmMessage,
  onAction,
}: ConfirmModalProps) => {
  if (!show) return null;

  
  return (
    <div
      className="modal fade show d-block shadowDarkBackground"
      onClick={() => onAction(null)} // clic afuera cierra
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirmación</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => onAction(null)}
            />
          </div>
          <div className="modal-body">
            <p>{confirmMessage}</p>
          </div>
          <div className="modal-footer">
            <button
              onClick={() => onAction(false)}
              type="button"
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={() => onAction(true)}
              type="button"
              className="btn btn-primary"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

