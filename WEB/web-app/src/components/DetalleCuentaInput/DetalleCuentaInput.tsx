import { useEffect, useState } from "react";
import { ConfirmModal } from "../Modals/LoadingModal/ConfirmModal";
import { DTO_DetalleCuentaJSON, DTO_Param } from "@/models";

interface Props {
  value?: DTO_DetalleCuentaJSON;
  onChange: (val?: DTO_DetalleCuentaJSON) => void;
  monto: number;
  setMonto: (val: number) => void;
  onEnabledChange?: (enabled: boolean) => void;
}

export const DetalleCuentaInput = ({
  value,
  onChange,
  monto,
  setMonto,
  onEnabledChange,
}: Props) => {
  const [enabled, setEnabled] = useState(!!value);
  const [filas, setFilas] = useState<DTO_Param[]>([]);
  const [nombreFila, setNombreFila] = useState("");
  const [valorFila, setValorFila] = useState("");
  const [descuento, setDescuento] = useState<DTO_Param>({
    nombre: "Monto",
    valor: "",
  });
  const [impuesto, setImpuesto] = useState<DTO_Param>({
    nombre: "Porcentaje",
    valor: "",
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);
  const [autoInicializado, setAutoInicializado] = useState(false);

  // Se ejecuta una sola vez al recibir datos de edición
  useEffect(() => {
    if (!value || autoInicializado) return;

    const tieneFilas = value.filas && value.filas.length > 0;
    const tieneDescuento = !!value.descuento?.valor;
    const tieneImpuesto = !!value.impuesto?.valor;

    if (!tieneFilas && !tieneDescuento && !tieneImpuesto) {
      setEnabled(false);
      onEnabledChange?.(false); // 🔒 importante para estado externo
      setAutoInicializado(true);
      return;
    }

    setFilas(value.filas || []);
    setDescuento(value.descuento || { nombre: "Monto", valor: "" });
    setImpuesto(value.impuesto || { nombre: "Porcentaje", valor: "" });

    setEnabled(true);
    onEnabledChange?.(true);
    setAutoInicializado(true);
  }, [value, autoInicializado]);

  // Cálculo de monto dinámico
  useEffect(() => {
    if (!enabled) return;

    const suma = filas.reduce(
      (acc, item) => acc + parseFloat(item.valor || "0"),
      0
    );

    const desc =
      descuento.nombre === "Porcentaje"
        ? suma * (parseFloat(descuento.valor || "0") / 100)
        : parseFloat(descuento.valor || "0");

    const imp =
      suma > 0 ? (suma - desc) * (parseFloat(impuesto.valor || "0") / 100) : 0;

    const total = suma - desc + imp;

    setMonto(parseFloat(total.toFixed(2)));

    onChange({
      filas,
      descuento,
      impuesto,
    });
  }, [filas, descuento, impuesto, enabled]);

  const agregarFila = () => {
    if (nombreFila && valorFila && !isNaN(parseFloat(valorFila))) {
      setFilas([...filas, { nombre: nombreFila, valor: valorFila }]);
      setNombreFila("");
      setValorFila("");
    }
  };

  const eliminarFila = (index: number) => {
    const nuevas = [...filas];
    nuevas.splice(index, 1);
    setFilas(nuevas);
  };

  const toggleDetalle = () => {
    if (enabled) {
      setPendingToggle(false);
      setConfirmModalMessage(
        "¿Deseas desactivar el detalle? Se borrará el valor actual."
      );
    } else {
      if (monto > 0) {
        setPendingToggle(true);
        setConfirmModalMessage(
          "Al activar el detalle se eliminará el monto manual actual. ¿Deseas continuar?"
        );
      } else {
        setEnabled(true);
        onEnabledChange?.(true);
        return;
      }
    }
    setIsConfirmOpen(true);
  };

  const confirmModalAction = (confirm: boolean | null) => {
    if (confirm && pendingToggle !== null) {
      if (pendingToggle) {
        setEnabled(true);
        setMonto(0);
        onEnabledChange?.(true);
      } else {
        setMonto(0);
        setEnabled(false);
        onEnabledChange?.(false);
        onChange(undefined);
        setFilas([]);
        setDescuento({ nombre: "Monto", valor: "" });
        setImpuesto({ nombre: "Porcentaje", valor: "" });
      }
    }
    setIsConfirmOpen(false);
    setPendingToggle(null);
  };

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center mb-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={pendingToggle !== null ? pendingToggle : enabled}
            onChange={toggleDetalle}
            id="detalleSwitch"
          />
          <label
            className="form-check-label fw-semibold"
            htmlFor="detalleSwitch"
          >
            Detalle de la cuenta
          </label>
        </div>
      </div>

      <ConfirmModal
        show={isConfirmOpen}
        confirmMessage={confirmModalMessage}
        onAction={confirmModalAction}
      />

      {enabled && (
        <div className="border rounded-3 shadow-sm p-4 bg-white">
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Detalles</h5>
            {filas.length === 0 && (
              <div className="text-muted fst-italic mb-2">
                No hay detalles agregados.
              </div>
            )}
            {filas.map((item, idx) => (
              <div
                key={idx}
                className="d-flex justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light"
              >
                <div>
                  <span className="fw-semibold">{item.nombre}</span>
                  <span className="mx-2 text-secondary">|</span>
                  <span className="text-success fw-bold">
                    ₡
                    {parseFloat(item.valor).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => eliminarFila(idx)}
                  title="Eliminar"
                >
                  <i className="bi bi-trash" />
                </button>
              </div>
            ))}
          </div>

          <div className="row g-3 mb-2">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Nombre del detalle
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del detalle"
                value={nombreFila}
                onChange={(e) => setNombreFila(e.target.value)}
              />
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <div className="flex-grow-1 me-2">
                <label className="form-label fw-semibold">Monto</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Monto"
                  value={valorFila}
                  onChange={(e) => setValorFila(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-success btn-icon"
                  title="Agregar fila"
                  onClick={agregarFila}
                  disabled={
                    !nombreFila || !valorFila || isNaN(parseFloat(valorFila))
                  }
                >
                  <i className="bi bi-plus-lg" />
                </button>
              </div>
            </div>

            <div className="row g-3 mb-2">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Descuento</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    value={descuento.valor}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (descuento.nombre === "Porcentaje") {
                        if (parseFloat(val) > 100) val = "100";
                        if (parseFloat(val) < 0) val = "0";
                      } else {
                        if (parseFloat(val) < 0) val = "0";
                      }
                      setDescuento({ ...descuento, valor: val });
                    }}
                    min="0"
                    {...(descuento.nombre === "Porcentaje" ? { max: 100 } : {})}
                  />
                  <button
                    type="button"
                    className={`btn ${
                      descuento.nombre === "Porcentaje"
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                    onClick={() => {
                      setDescuento((prev) => ({
                        nombre:
                          prev.nombre === "Porcentaje" ? "Monto" : "Porcentaje",
                        valor: "0",
                      }));
                    }}
                    title="Cambiar tipo"
                  >
                    {descuento.nombre === "Porcentaje" ? "%" : "₡"}
                  </button>
                </div>
                <small className="form-text text-muted">
                  Tipo: <span className="fw-bold">{descuento.nombre}</span>
                </small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Impuesto (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={impuesto.valor}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (parseFloat(val) > 100) val = "100";
                    if (parseFloat(val) < 0) val = "0";
                    setImpuesto({ nombre: "Porcentaje", valor: val });
                  }}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
