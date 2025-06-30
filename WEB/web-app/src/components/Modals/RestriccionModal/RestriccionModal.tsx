import { useEffect, useRef } from "react";

interface RestriccionModalProps {
  show: boolean;
  onClose?: () => void;
  onSave?: () => void;
  modalTitle: string;
  modalTexto: string;
}

export const RestriccionModal = ({
  show,
  onClose,
  onSave,
  modalTitle = "Advertencia",
  modalTexto,
}: RestriccionModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
    if (show && modalRef.current) {
      modalRef.current.classList.remove("shake-horizontal");
      // Trigger reflow to restart animation
      void modalRef.current.offsetWidth;
      modalRef.current.classList.add("shake-horizontal");
    }
  }, [show]);

  return (
    <>
      {/* shake-horizontal define una animación que mueve el elemento horizontalmente
       (de lado a lado) para simular un "temblor" o "sacudida". */}
      <div
        className={`modal fade${
          show ? " shake-horizontal show d-block shadowClearBackground " : ""
        }`}
        tabIndex={-1}
        role="dialog"
        aria-modal={show ? "true" : undefined}
        id="kt_modal_1"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h5 className="modal-title">{modalTitle}</h5>
              <button
                type="button"
                className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                aria-label="Close"
                onClick={onClose}
              >
                <span className="svg-icon svg-icon-2x"></span>
              </button>
            </div>
            <div className="modal-body">
              <p>{modalTexto}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cerrar
              </button>
              {onSave ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onSave}
                >
                  Guardar cambios
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
