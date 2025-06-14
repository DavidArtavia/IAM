import { useEffect, useState } from "react";

type Props = {
    msj?: string
}

export const LoadingPanel = ({ msj }: Props) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center my-5">
      <div
        className="spinner-border text-primary mb-3 spinner-border-lg"
        role="status"
      >
      </div>
      <span className="fw-semibold text-secondary" style={{ fontSize: 18 }}>
        {msj ? msj : "Cargando datos..."}
      </span>
    </div>
  );
}