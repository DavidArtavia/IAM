import { DTO_CuentasPorPagar } from "@/models";
import React, { useState, useEffect } from "react";

interface FormModalProps {
  show: boolean;
  onHide: () => void;
  formData: DTO_CuentasPorPagar;
  setFormData: React.Dispatch<React.SetStateAction<DTO_CuentasPorPagar>>;
  onSubmit: () => void;
}

const EmojiRegex = /\p{Emoji}/u;
const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const FormRegisterAccountModal = ({
  show,
  onHide,
  formData,
  setFormData,
  onSubmit,
}: FormModalProps) => {
  // Estados de error para cada campo
  const [errorConcepto, setErrorConcepto] = useState("");
  const [errorDescripcion, setErrorDescripcion] = useState("");
  const [errorSaldo, setErrorSaldo] = useState("");

  // Estado de display para saldo
  const [saldoDisplay, setSaldoDisplay] = useState("0");

  // Inicializar al abrir modal
  useEffect(() => {
    if (show) {
      setSaldoDisplay(
        formData.saldo != null ? numberFormatter.format(formData.saldo) : "0"
      );
      setErrorConcepto("");
      setErrorDescripcion("");
      setErrorSaldo("");
    }
  }, [show, formData.saldo]);

  // Validador de texto (Concepto/Descripción)
  const validateText = (value: string): string => {
    if (!value.trim()) return "Este campo es obligatorio";
    if (EmojiRegex.test(value)) return "No se permiten emoticones";
    return "";
  };

  // Handlers de Concepto y Descripción
  const handleConceptoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, concepto: val }));
    setErrorConcepto(validateText(val));
  };

  const handleDescripcionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, descripcion: val }));
    setErrorDescripcion(validateText(val));
  };

  // Handlers de Saldo
  const handleSaldoFocus = () => {
    if (saldoDisplay === "0") {
      setSaldoDisplay("");
    }
  };

  const handleSaldoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Actualizamos display tal cual escribe el usuario
    setSaldoDisplay(raw);

    // Intentamos parsear número (quitando comas)
    const num = parseFloat(raw.replace(/,/g, ""));
    if (raw.trim() === "") {
      setErrorSaldo("El saldo es obligatorio");
      setFormData((prev) => ({ ...prev, saldo: 0 }));
    } else if (isNaN(num)) {
      setErrorSaldo("Ingrese un número válido");
      setFormData((prev) => ({ ...prev, saldo: 0 }));
    } else if (num <= 0) {
      setErrorSaldo("El saldo debe ser mayor a cero");
      setFormData((prev) => ({ ...prev, saldo: num }));
    } else {
      setErrorSaldo("");
      setFormData((prev) => ({ ...prev, saldo: num }));
    }
  };

  const handleSaldoBlur = () => {
    const num = parseFloat(saldoDisplay.replace(/,/g, ""));
    const formatted =
      isNaN(num) || num <= 0 ? "0" : numberFormatter.format(num);
    setSaldoDisplay(formatted);
  };

  // Validación final y envío
  const handleSubmit = () => {
    const errC = validateText(formData.concepto ?? "");
    const errD = validateText(formData.descripcion ?? "");
    // volver a validar saldo por si no hubo cambios recientes
    const finalNum = formData.saldo;
    const errS =
      finalNum == null || finalNum <= 0 ? "El saldo debe ser mayor a cero" : "";
    setErrorConcepto(errC);
    setErrorDescripcion(errD);
    setErrorSaldo(errS);

    if (!errC && !errD && !errS) {
      onSubmit();
    }
  };

  // Si no está visible, nada
  if (!show) return null;

  // Determinar si hay errores para deshabilitar el botón
  const hasErrors = !!errorConcepto || !!errorDescripcion || !!errorSaldo;

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
          {/* HEADER */}
          <div className="modal-header">
            <h2>Crear cuenta</h2>
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-color-primary"
              onClick={onHide}
            >
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="modal-body py-10 px-lg-17">
            <div className="row mb-5">
              {/* Concepto */}
              <div className="col-md-6 fv-row">
                <label
                  htmlFor="concepto"
                  className="required fs-5 fw-bold mb-2"
                >
                  Concepto
                </label>
                <input
                  id="concepto"
                  name="concepto"
                  type="text"
                  className={`form-control form-control-solid ${
                    errorConcepto
                      ? "is-invalid"
                      : formData.concepto
                      ? "is-valid"
                      : ""
                  }`}
                  value={formData.concepto ?? ""}
                  onChange={handleConceptoChange}
                />
                {errorConcepto ? (
                  <div className="invalid-feedback">{errorConcepto}</div>
                ) : formData.concepto ? (
                  <div className="valid-feedback">¡Perfecto!</div>
                ) : null}
              </div>

              {/* Descripción */}
              <div className="col-md-6 fv-row">
                <label
                  htmlFor="descripcion"
                  className="required fs-5 fw-bold mb-2"
                >
                  Descripción
                </label>
                <input
                  id="descripcion"
                  type="text"
                  className={`form-control form-control-solid ${
                    errorDescripcion
                      ? "is-invalid"
                      : formData.descripcion
                      ? "is-valid"
                      : ""
                  }`}
                  value={formData.descripcion ?? ""}
                  onChange={handleDescripcionChange}
                />
                {errorDescripcion ? (
                  <div className="invalid-feedback">{errorDescripcion}</div>
                ) : formData.descripcion ? (
                  <div className="valid-feedback">¡Perfecto!</div>
                ) : null}
              </div>
            </div>

            {/* Saldo */}
            <div className="d-flex flex-column mb-5 fv-row">
              <label htmlFor="saldo" className="required fs-5 fw-bold mb-2">
                Saldo
              </label>
              <input
                id="saldo"
                type="text"
                className={`form-control form-control-solid ${
                  errorSaldo
                    ? "is-invalid"
                    : formData.saldo! > 0
                    ? "is-valid"
                    : ""
                }`}
                value={saldoDisplay}
                onFocus={handleSaldoFocus}
                onChange={handleSaldoChange}
                onBlur={handleSaldoBlur}
              />
              {errorSaldo && (
                <div className="invalid-feedback">{errorSaldo}</div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer flex-center">
            <button
              type="button"
              className="btn btn-light me-3"
              onClick={onHide}
            >
              Descartar
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={hasErrors}
              onClick={handleSubmit}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
