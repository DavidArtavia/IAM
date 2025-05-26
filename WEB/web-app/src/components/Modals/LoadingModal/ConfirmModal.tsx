import { useEffect } from "react";

interface ConfirmModalProps {
    confirmMessage?: string;
    onAction: (action: boolean | null) => void;
}

export const ConfirmModal = ({ confirmMessage, onAction }: ConfirmModalProps) => {

    useEffect(() => {
        console.log("entr+o");
    }, [confirmMessage]);

    return (
        <div className="modal fade" id="confirmModal" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalCenterTitle">Confirmación</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p>{confirmMessage}</p>
                    </div>
                    <div className="modal-footer">
                        <button onClick={() => onAction(false)} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button onClick={() => onAction(true)} type="button" className="btn btn-primary">Aceptar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
