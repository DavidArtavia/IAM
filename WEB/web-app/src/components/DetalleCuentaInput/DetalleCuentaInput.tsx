import { useEffect, useState } from "react";
import { ConfirmModal } from "../Modals/LoadingModal/ConfirmModal";
import { DTO_DetalleCuentaJSON, DTO_Param } from "@/models";

interface Props {
  value?: DTO_DetalleCuentaJSON;
  onChange: (val?: DTO_DetalleCuentaJSON) => void;
  onBlur?: () => void;
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
  onBlur,
}: Props) => {
  const [enabled, setEnabled] = useState(false);
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

  // ✅ Inicialización única si hay datos
  useEffect(() => {
    if (autoInicializado) return;

    const tieneFilas = value?.filas?.length;
    const tieneDescuento = !!value?.descuento?.valor;
    const tieneImpuesto = !!value?.impuesto?.valor;

    if (tieneFilas || tieneDescuento || tieneImpuesto) {
      setFilas(value?.filas || []);
      setDescuento(value?.descuento || { nombre: "Monto", valor: "" });
      setImpuesto(value?.impuesto || { nombre: "Porcentaje", valor: "" });
      setEnabled(true);
      onEnabledChange?.(true);
    } else {
      setEnabled(false);
      onEnabledChange?.(false);
    }

    setAutoInicializado(true);
  }, [value, autoInicializado]);

  
  // ✅ Calcula monto si está habilitado
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

  useEffect(() => {
    const hayTexto = nombreFila.trim() !== "" || valorFila.trim() !== "";

    const tienePendientes = enabled && hayTexto;

    if (tienePendientes) {
      // Forzar un valor que haga fallar validación, pero sea único para que se dispare el render
      onChange(("error_force_" + Date.now()) as any);
      onBlur?.();
    } else {
      onChange({
        filas,
        descuento,
        impuesto,
      });
    }

  }, [nombreFila, valorFila, filas, descuento, impuesto, enabled]);


  const agregarFila = () => {
    if (nombreFila && valorFila && !isNaN(parseFloat(valorFila))) {
      setFilas([...filas, { nombre: nombreFila, valor: valorFila }]);
      setNombreFila("");
      setValorFila("");
    }
  };
  const limpiarCampos = () => {
    setNombreFila("");
    setValorFila("");
  };



  const eliminarFila = (index: number) => {
    const nuevas = [...filas];
    nuevas.splice(index, 1);
    setFilas(nuevas);
  };

  const toggleDetalle = () => {
    if (enabled) {
      
      if (filas.length === 0 && (descuento.valor == "0" || descuento.valor === '') && (impuesto.valor == "0" || impuesto.valor === '')) {
        setPendingToggle(false);
        setEnabled(false);
        confirmModalAction(true);
      } else {
        setIsConfirmOpen(true);
        setPendingToggle(false);
        setConfirmModalMessage(
          "¿Desea desactivar el detalle? Se eliminarán las filas y los valores ingresados."
        );
      }
    } else {
      if (monto > 0) {
        setIsConfirmOpen(true);
        setPendingToggle(true);
        setConfirmModalMessage(
          "Al activar el detalle se eliminará el monto actual y será calculado con los valores de cada fila agregada. ¿Desea continuar?"
        );
      } else {
        setEnabled(true);
        setPendingToggle(false);
        onEnabledChange?.(true);
        return;
      }
    }
    //setIsConfirmOpen(true);
  };

  const confirmModalAction = (confirm: boolean | null) => {
    if (confirm && pendingToggle !== null) {
      if (pendingToggle) {
        setEnabled(true);
        setMonto(0);
        onEnabledChange?.(true);
      } else {
        setEnabled(false);
        setMonto(0);
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
            checked={enabled}
            onChange={toggleDetalle}
            id="detalleSwitch"
          />
          <label
            className="form-check-label fs-5"
            htmlFor="detalleSwitch"
          >
            Detalle
          </label>
        </div>
      </div>

      <ConfirmModal
        show={isConfirmOpen}
        confirmMessage={confirmModalMessage}
        onAction={confirmModalAction}
      />
      {enabled && (
        <div className="bg-white">
          <div className="mb-4">
            {filas.length === 0 && (

              <div className="dt-empty-state d-flex flex-column align-items-center justify-content-center py-10">
                <i className="bi bi-inbox fs-1 text-muted" aria-hidden="true"></i>
                <span className="text-muted mt-2">No hay detalles agregados.</span>
              </div>
            )}
            {filas.map((item, idx) => (
              <div
                key={idx}
                className="d-flex justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light"
              >
                <div>
                  <span className="">{item.nombre}</span>
                  <span className="mx-2 text-secondary">|</span>
                  <span className="text-success">
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

          {/* Nueva fila */}
          {/* Contenedor principal */}
          <div style={{ width: "100%" }}>
            {/* Row: Nombre y Monto (SIEMPRE en la misma línea) */}
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-end",
                flexWrap: "nowrap", // evita que se apilen
                width: "100%",
              }}
            >
              {/* Nombre: ocupa lo restante y puede encogerse */}
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre del detalle"
                  value={nombreFila}
                  onChange={(e) => setNombreFila(e.target.value)}
                  style={{ fontSize: "1.03rem", width: "100%", minWidth: 0 }}
                />
              </div>

              {/* Monto: ancho fijo razonable */}
              <div style={{ flex: "0 0 160px", minWidth: 120 }}>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Monto"
                  value={valorFila}
                  onChange={(e) => setValorFila(e.target.value)}
                  min="0"
                  step="any"
                  style={{ fontSize: "0.95rem", width: "100%" }}
                />
              </div>
            </div>

            {/* Botones: colocados debajo (siempre) */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 8,
                width: "100%",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={limpiarCampos}
                title="Limpiar"
              >
                <i className="bi bi-arrow-counterclockwise" />
              </button>
              <button
                type="button"
                className="btn btn-primary btn-icon"
                title="Agregar fila"
                onClick={agregarFila}
                disabled={!nombreFila || !valorFila || isNaN(parseFloat(valorFila))}
              >
                <i className="bi bi-plus-lg" />
              </button>


            </div>

            {/* Descuento & Impuesto (igual que antes) */}
            <div className="row g-3 mt-3">
              <div className="col-12 col-md-6">
                <label className="fs-5">Descuento ({descuento.nombre === "Porcentaje" ? "%" : "₡"})</label>
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="0.00"
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
                    className={`btn ${descuento.nombre === "Porcentaje" ? "btn-primary" : "btn-secondary"} btn-icon pulse`}
                    onClick={() =>
                      setDescuento((prev) => ({
                        nombre: prev.nombre === "Porcentaje" ? "Monto" : "Porcentaje",
                        valor: "0",
                      }))
                    }
                    title="Cambiar tipo"
                  >
                    {descuento.nombre === "Porcentaje" ? "%" : "₡"}
                    <span className="pulse-ring" />
                  </button>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="fs-5">Impuesto (%)</label>
                <input
                  type="number"
                  placeholder="0.00"
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
