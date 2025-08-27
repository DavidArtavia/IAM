import { useEffect, useMemo, useRef, useState } from "react";
import {
  AsyncClientSelect,
  AsyncTarifaSelect,
  ClientOption,
  FieldConfig,
  TarifarioOption,
} from "@/components";
import { useApp } from "@/hooks/useApp";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import { DTO_Proforma, DTO_ProformaItem, DTO_Respuesta } from "@/models";
import { calcularTotales, TipoDescuento } from "@/utils/profromasHelpers";
import { notificationHelpers, procesarRespuesta } from "@/utils";
import { proformaService } from "@/services/proformas.service";
import { items_proformaService } from "@/services";

type Props = {
  show: boolean;
  onClose: () => void;
  onRegistered?: (nuevaProforma: DTO_Proforma) => void;
};

type ItemLocal = {
  idTemp: string;
  iD_Tarifa?: number | null;
  nombreItemProforma: string;
  descripcionItemProforma: string;
  precioItemProforma?: number;
  cantidadItemProforma?: number;
};

export const ProformaCrearEditarModal = (props: Props) => {
  const { show, onClose, onRegistered } = props;
  const { state } = useApp();
  const negocio = state.negocio;

  // Cabecera
  const [clienteOpt, setClienteOpt] = useState<ClientOption | null>(null);
  const [descuentoTipo, setDescuentoTipo] = useState<TipoDescuento>("Monto");
  const [descuentoValor, setDescuentoValor] = useState<number>();
  const [impuesto, setImpuesto] = useState<number>();
  const [observaciones, setObservaciones] = useState<string>("");
  const [fechaP, setFechaP] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [fechaV, setFechaV] = useState<string>(
    dayjs().add(15, "day").format("YYYY-MM-DD")
  );
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  // contenedor de inputs "Nombre" por fila (clave = idTemp)
  const nombreRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // guarda el idTemp del último ítem agregado
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // referencia al body del modal (para scroll al agregar ítem)
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Ítems
  const [items, setItems] = useState<ItemLocal[]>([
    {
      idTemp: uuid(),
      nombreItemProforma: "",
      descripcionItemProforma: "",
      precioItemProforma: 0,
      cantidadItemProforma: 1,
    },
  ]);

  //#region 🧩 Efecto para foco y scroll al agregar ítem
  useEffect(() => {
    if (!lastAddedId) return;
    // esperamos un frame para que React pinte la nueva fila
    const id = lastAddedId;
    const t = requestAnimationFrame(() => {
      const input = nombreRefs.current[id];
      if (input) {
        // foco sin salto brusco
        input.focus({ preventScroll: true });
        // colocar el cursor al final
        const len = input.value.length;
        input.setSelectionRange?.(len, len);
        // desplazar el contenedor hasta el input
        input.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    });
    //#endregion
    // limpiamos para no re-disparar
    setLastAddedId(null);
    return () => cancelAnimationFrame(t);
  }, [items, lastAddedId]);

  const [tarifaSel, setTarifaSel] = useState<TarifarioOption | null>(null);

  // Totales
  const totales = useMemo(
    () =>
      calcularTotales(
        items,
        descuentoTipo,
        typeof descuentoValor === "number" ? descuentoValor : 0,
        typeof impuesto === "number" ? impuesto : 0
      ),
    [items, descuentoTipo, descuentoValor, impuesto]
  );

  // Fields cabecera
  const headerFields: FieldConfig<DTO_Proforma>[] = [
    {
      key: "iD_Cliente",
      label: "Cliente",
      type: "custom",
      required: true,
      renderer: ({ onChange }) => (
        <div style={{ zIndex: 1061 }}>
          <AsyncClientSelect
            value={clienteOpt}
            onChange={(opt) => {
              setClienteOpt(opt);
              onChange(opt?.value ?? 0);
            }}
          />
        </div>
      ),
    },
    {
      key: "fechaProforma",
      label: "Fecha",
      type: "custom",
      renderer: () => (
        <input
          type="date"
          className="form-control"
          value={fechaP}
          onChange={(e) => setFechaP(e.target.value)}
        />
      ),
    },
    {
      key: "fechaVencimiento",
      label: "Vence",
      type: "custom",
      renderer: () => (
        <input
          type="date"
          className="form-control"
          value={fechaV}
          onChange={(e) => setFechaV(e.target.value)}
        />
      ),
    },
    {
      key: "observacionProforma",
      label: "Observaciones",
      type: "custom",
      renderer: () => (
        <textarea
          className="form-control"
          rows={2}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      ),
    },
    {
      key: "descuentoProforma",
      label: "Descuento",
      type: "custom",
      renderer: () => (
        <div className="col-12">
          <div className="input-group">
            <input
              type="number"
              placeholder={descuentoTipo === "Porcentaje" ? "%" : "₡0.00"}
              className="form-control"
              value={descuentoValor ?? ""}
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                const blocked = ["-", "+", "e", "E"];
                if (blocked.includes(e.key) || e.code === "NumpadSubtract") {
                  e.preventDefault();
                }
              }}
              onBeforeInput={(e: any) => {
                if (e?.data && /[-+eE]/.test(e.data)) e.preventDefault();
              }}
              onPaste={(e) => {
                const txt = e.clipboardData.getData("text");
                const cleaned = txt.replace(/[^0-9.,]/g, "").replace(",", ".");
                let num = Number(cleaned);
                if (Number.isNaN(num)) {
                  e.preventDefault();
                  return;
                }
                if (descuentoTipo === "Porcentaje") {
                  num = Math.max(0, Math.min(100, num));
                } else {
                  num = Math.max(0, num);
                }
                setDescuentoValor(num > 0 ? num : undefined);
                e.preventDefault();
              }}
              onChange={(e) => {
                const raw = e.target.value.replace(",", ".");
                if (raw === "") {
                  setDescuentoValor(undefined);
                  return;
                }
                let val = Number(raw);
                if (!Number.isFinite(val)) return;
                if (descuentoTipo === "Porcentaje") {
                  if (val < 0) val = 0;
                  if (val > 100) val = 100;
                } else {
                  if (val < 0) val = 0;
                }
                setDescuentoValor(val > 0 ? val : undefined);
              }}
              min={0}
              max={descuentoTipo === "Porcentaje" ? 100 : undefined}
            />
            <button
              type="button"
              className={`btn ${
                descuentoTipo === "Porcentaje" ? "btn-primary" : "btn-secondary"
              } btn-icon pulse`}
              onClick={() => {
                setDescuentoTipo((prev) =>
                  prev === "Porcentaje" ? "Monto" : "Porcentaje"
                );
                setDescuentoValor(undefined);
              }}
              title="Cambiar tipo"
              aria-label="Cambiar tipo de descuento"
            >
              {descuentoTipo === "Porcentaje" ? "%" : "₡"}
              <span className="pulse-ring" />
            </button>
          </div>
          <small className="text-muted">
            Tipo: {descuentoTipo === "Porcentaje" ? "Porcentaje" : "Monto"}
          </small>
        </div>
      ),
    },
    {
      key: "impuestoPorcentualProforma",
      label: "IVA (%)",
      type: "custom",
      renderer: () => (
        <input
          type="number"
          placeholder="0.00"
          className="form-control"
          value={impuesto ?? ""}
          min={0}
          max={100}
          step="1"
          inputMode="decimal"
          onWheel={(e) => e.currentTarget.blur()}
          onKeyDown={(e) => {
            const blocked = ["-", "+", "e", "E"];
            if (blocked.includes(e.key) || e.code === "NumpadSubtract") {
              e.preventDefault();
            }
          }}
          onBeforeInput={(e: any) => {
            if (e?.data && /[-+eE]/.test(e.data)) e.preventDefault();
          }}
          onPaste={(e) => {
            const txt = e.clipboardData.getData("text");
            const cleaned = txt.replace(/[^0-9.,]/g, "").replace(",", ".");
            const num = Number(cleaned);
            if (Number.isNaN(num)) {
              e.preventDefault();
              return;
            }
            const clamped = Math.max(0, Math.min(100, num));
            setImpuesto(clamped);
            e.preventDefault();
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(",", ".");
            if (raw === "") {
              setImpuesto(undefined);
              return;
            }
            let val = Number(raw);
            if (!Number.isFinite(val)) return;
            if (val < 0) val = 0;
            if (val > 100) val = 100;
            setImpuesto(val);
          }}
        />
      ),
    },
    {
      key: "cliente",
      label: "Logo",
      type: "custom",
      renderer: () => (
        <div className="d-flex align-items-center gap-3">
          <label
            htmlFor="logo-upload"
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            style={{ cursor: "pointer" }}
          >
            <i className="bi bi-upload" />
            {logoDataUrl ? "Cambiar logo" : "Subir logo"}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const b64 = await toDataUrl(f);
                setLogoDataUrl(b64);
              }}
            />
          </label>
          {logoDataUrl && (
            <div className="border rounded shadow-sm p-1 bg-white">
              <img
                src={logoDataUrl}
                alt="Logo"
                style={{
                  height: 40,
                  maxWidth: 120,
                  objectFit: "contain",
                  display: "block",
                }}
              />
              <button
                type="button"
                className="btn btn-link btn-sm text-danger mt-1 w-100"
                style={{ fontSize: 13 }}
                onClick={() => setLogoDataUrl(null)}
                title="Quitar logo"
              >
                <i className="bi bi-trash" /> Quitar
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Ítems handlers
  function addItemVacio() {
    const id = uuid();
    setItems((prev) => [
      ...prev,
      {
        idTemp: id,
        nombreItemProforma: "",
        descripcionItemProforma: "",
        precioItemProforma: 0,
        cantidadItemProforma: 1,
      },
    ]);
    setLastAddedId(id);
  }

  function addItemDesdeTarifa(opt: TarifarioOption | null) {
    setTarifaSel(opt);
    const id = uuid();
    if (!opt) return;
    const t = opt.tarifa;
    setItems((prev) => [
      ...prev,
      {
        idTemp: id,
        iD_Tarifa: t.iD_Tarifa,
        nombreItemProforma: t.nombreTarifa,
        descripcionItemProforma: t.descripcionTarifa ?? "",
        precioItemProforma: Number(t.precioTarifa ?? 0),
        cantidadItemProforma: 1,
      },
    ]);
    setLastAddedId(id);
  }

  function patchItem(idTemp: string, patch: Partial<ItemLocal>) {
    setItems((prev) =>
      prev.map((i) => (i.idTemp === idTemp ? { ...i, ...patch } : i))
    );
  }

  function removeItem(idTemp: string) {
    delete nombreRefs.current[idTemp];
    setItems((prev) => prev.filter((i) => i.idTemp !== idTemp));
  }

  // Guardar
  function handleGuardar() {
    if (!clienteOpt?.value) {
      notificationHelpers.warningAlert("Seleccione un cliente.");
      return;
    }
    if (!items.length) {
      notificationHelpers.warningAlert("Agregue al menos un ítem.");
      return;
    }
    if (
      items.some(
        (i) => !i.nombreItemProforma || Number(i.cantidadItemProforma ?? 0) <= 0
      )
    ) {
      notificationHelpers.warningAlert(
        "Verifique nombre y cantidad (>0) en los ítems."
      );
      return;
    }

    const dto: DTO_Proforma = {
      iD_Proforma: 0,
      iD_Negocio: Number(negocio?.iD_Negocio ?? 0),
      iD_Cliente: Number(clienteOpt.value),
      estado: undefined as any,
      fechaProforma: new Date(fechaP),
      fechaVencimiento: new Date(fechaV),
      observacionProforma: observaciones ?? "",
      fechaModificacion: undefined,
      descuentoProforma: Number(descuentoValor || 0),
      descuentoPorcentualProforma: descuentoTipo === "Porcentaje",
      impuestoPorcentualProforma: Number(impuesto || 0),
      subTotal: totales.subTotal,
      montoDescuento: totales.montoDescuento,
      baseImponible: totales.baseImponible,
      montoImpuesto: totales.montoImpuesto,
      totalCalculado: totales.totalCalculado,
      cliente: undefined,
    };

    const sub = proformaService.registrarProformas(dto).subscribe({
      next: async (r: DTO_Respuesta) => {
        const parsed = procesarRespuesta(r) as unknown as DTO_Proforma;
        const idProforma = parsed.iD_Proforma;
        if (!idProforma || Number.isNaN(idProforma)) {
          notificationHelpers.errorAlert("No se obtuvo el ID de la proforma.");
          return;
        }
        for (const it of items) {
          const dti: DTO_ProformaItem = {
            iD_ProformaItem: 0,
            iD_Proforma: idProforma,
            estado: undefined as any,
            nombreItemProforma: it.nombreItemProforma,
            descripcionItemProforma: it.descripcionItemProforma,
            precioItemProforma: Number(it.precioItemProforma ?? 0),
            cantidadItemProforma: Number(it.cantidadItemProforma ?? 0),
            fechaCreacion: undefined,
            fechaModificacion: undefined,
          };
          const r2 = await items_proformaService
            .registrarItemProforma(dti)
            .toPromise();
          if (!r2?.tipoRespuesta) {
            notificationHelpers.errorAlert(
              r2?.mensaje ?? "Error al registrar item."
            );
            return;
          }
        }
        notificationHelpers.successAlert("Proforma registrada correctamente.");

        // preparar objeto proforma completo para retornar al padre
        const nuevaProformaParaLaTabla = {
          ...parsed,
          cliente: { nombreCliente: clienteOpt.label } as any,
          subTotal: totales.subTotal,
          montoDescuento: totales.montoDescuento,
          baseImponible: totales.baseImponible,
          montoImpuesto: totales.montoImpuesto,
          totalCalculado: totales.totalCalculado,
          descuentoProforma: dto.descuentoProforma,
          impuestoPorcentualProforma: dto.impuestoPorcentualProforma,
        };

        onRegistered?.(nuevaProformaParaLaTabla);

        // resetear todo
        setClienteOpt(null);
        setDescuentoTipo("Monto");
        setDescuentoValor(undefined);
        setImpuesto(undefined);
        setObservaciones("");
        setFechaP(dayjs().format("YYYY-MM-DD"));
        setFechaV(dayjs().add(15, "day").format("YYYY-MM-DD"));
        setLogoDataUrl(null);
        setTarifaSel(null);
        setItems([
          {
            idTemp: uuid(),
            nombreItemProforma: "",
            descripcionItemProforma: "",
            precioItemProforma: 0,
            cantidadItemProforma: 1,
          },
        ]);
        nombreRefs.current = {};
        setLastAddedId(null);
        onClose();
      },
      error: (err) =>
        notificationHelpers.errorAlert(
          err?.message ?? "Error al registrar proforma"
        ),
      complete: () => sub?.unsubscribe?.(),
    });
  }

  // PDF
  const printRef = useRef<HTMLDivElement>(null);
  async function handlePdf() {
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      const el = printRef.current;
      if (!el) return;
      await new Promise((r) => requestAnimationFrame(r));
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const pdf = new jsPDF("p", "pt", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(canvas, "PNG", (pageW - w) / 2, 20, w, h);
      pdf.save(`Proforma_${dayjs().format("YYYYMMDD_HHmm")}.pdf`);
    } catch (err) {
      console.error(err);
      notificationHelpers?.errorAlert?.(
        "No se pudo generar el PDF. Verifica que el contenedor no esté oculto con display:none."
      );
    }
  }

  if (!show) return null;

  return (
    <>
      <div
        className="modal shadowClearBackground fade show d-block"
        role="dialog"
        tabIndex={-1}
        onClick={(e) => {
          // Solo cerrar si el click es en el fondo, no en el contenido
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Fullscreen en sm-down para UX móvil */}
        <div className="modal-dialog modal-fullscreen-sm-down modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nueva Proforma</h5>
              <button
                className="btn btn-sm btn-icon btn-light"
                onClick={onClose}
                aria-label="Cerrar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="modal-body" ref={modalBodyRef}>
              {/* Cabecera */}
              <div className="row g-4">
                {headerFields.map((f, i) => (
                  <div key={i} className="col-12 col-md-6">
                    <label className="form-label fw-semibold mb-1">
                      {f.label}
                    </label>
                    {f.renderer?.({ value: null, onChange: () => {} })}
                  </div>
                ))}
              </div>

              {/* Ítems */}
              <div className="card mt-6">
                <div className="card-header pb-0">
                  <div className="card-title fw-bold">Ítems</div>
                </div>
                <div className="card-body">
                  {/* Selección de tarifa (input izq) + botón (der pegado) */}
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-4">
                    <div
                      className="flex-grow-1 min-w-0"
                      style={{ zIndex: 1061 }}
                    >
                      {negocio && (
                        <div
                          style={{
                            minWidth: 220,
                            maxWidth: 320,
                            width: "100%",
                          }}
                        >
                          <AsyncTarifaSelect
                            value={tarifaSel}
                            onChange={addItemDesdeTarifa}
                            reloadKey={0}
                            negocio={negocio}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      className="btn btn-light-primary ms-auto"
                      onClick={addItemVacio}
                    >
                      Agregar ítem
                    </button>
                  </div>

                  {/* === Vista DESKTOP (≥ md): tabla clásica === */}
                  <div className="table-responsive d-none d-md-block">
                    <table className="table align-middle table-row-dashed gy-2">
                      <thead>
                        <tr className="fw-semibold text-muted">
                          <th style={{ width: 48 }}>#</th>
                          <th>Nombre</th>
                          <th className="">Descripción</th>
                          <th className="text-end" style={{ width: 140 }}>
                            P. Unit
                          </th>
                          <th className="text-end" style={{ width: 120 }}>
                            Cant.
                          </th>
                          <th className="text-end" style={{ width: 160 }}>
                            Importe
                          </th>
                          <th style={{ width: 60 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, idx) => {
                          const importe =
                            Number(it.precioItemProforma ?? 0) *
                            Number(it.cantidadItemProforma ?? 0);
                          return (
                            <tr key={it.idTemp}>
                              <td>{idx + 1}</td>
                              <td>
                                <input
                                  className="form-control form-control-sm"
                                  ref={(el) => {
                                    nombreRefs.current[it.idTemp] = el;
                                  }}
                                  value={it.nombreItemProforma}
                                  onChange={(e) =>
                                    patchItem(it.idTemp, {
                                      nombreItemProforma: e.target.value,
                                    })
                                  }
                                  placeholder="Nombre del ítem"
                                />
                              </td>
                              <td>
                                <input
                                  className="form-control form-control-sm"
                                  value={it.descripcionItemProforma}
                                  onChange={(e) =>
                                    patchItem(it.idTemp, {
                                      descripcionItemProforma: e.target.value,
                                    })
                                  }
                                  placeholder="Descripción (opcional)"
                                />
                              </td>
                              <td className="text-end">
                                <input
                                  type="number"
                                  step="1"
                                  min={0}
                                  className="form-control form-control-sm text-end"
                                  value={it.precioItemProforma ?? 0}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    const blocked = ["-", "+", "e", "E"];
                                    if (
                                      blocked.includes(e.key) ||
                                      e.code === "NumpadSubtract"
                                    )
                                      e.preventDefault();
                                  }}
                                  onBeforeInput={(e: any) => {
                                    if (e?.data && /[-+eE]/.test(e.data))
                                      e.preventDefault();
                                  }}
                                  onPaste={(e) => {
                                    const txt = e.clipboardData.getData("text");
                                    const cleaned = txt
                                      .replace(/[^0-9.,]/g, "")
                                      .replace(",", ".");
                                    let num = Number(cleaned);
                                    if (Number.isNaN(num)) {
                                      e.preventDefault();
                                      return;
                                    }
                                    num = Math.max(0, num);
                                    patchItem(it.idTemp, {
                                      precioItemProforma: num,
                                    });
                                    e.preventDefault();
                                  }}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(
                                      ",",
                                      "."
                                    );
                                    if (raw === "") {
                                      patchItem(it.idTemp, {
                                        precioItemProforma: 0,
                                      });
                                      return;
                                    }
                                    let val = Number(raw);
                                    if (!Number.isFinite(val)) return;
                                    if (val < 0) val = 0;
                                    patchItem(it.idTemp, {
                                      precioItemProforma: val,
                                    });
                                  }}
                                />
                              </td>
                              <td className="text-end">
                                <input
                                  type="number"
                                  step="1"
                                  min={1}
                                  className="form-control form-control-sm text-end"
                                  value={it.cantidadItemProforma ?? 1}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    const blocked = ["-", "+", "e", "E"];
                                    if (
                                      blocked.includes(e.key) ||
                                      e.code === "NumpadSubtract"
                                    )
                                      e.preventDefault();
                                  }}
                                  onBeforeInput={(e: any) => {
                                    if (e?.data && /[-+eE]/.test(e.data))
                                      e.preventDefault();
                                  }}
                                  onPaste={(e) => {
                                    const txt = e.clipboardData.getData("text");
                                    const cleaned = txt.replace(/[^0-9]/g, "");
                                    const num = Number(cleaned);
                                    if (Number.isNaN(num) || num < 1) {
                                      e.preventDefault();
                                      return;
                                    }
                                    patchItem(it.idTemp, {
                                      cantidadItemProforma: num,
                                    });
                                    e.preventDefault();
                                  }}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(
                                      ",",
                                      "."
                                    );
                                    if (raw === "") {
                                      patchItem(it.idTemp, {
                                        cantidadItemProforma: 1,
                                      });
                                      return;
                                    }
                                    let val = Number(raw);
                                    if (!Number.isFinite(val)) return;
                                    if (val < 1) val = 1;
                                    patchItem(it.idTemp, {
                                      cantidadItemProforma: val,
                                    });
                                  }}
                                />
                              </td>
                              <td className="text-end">
                                <span className="fw-bold">
                                  {importe.toFixed(2)}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-icon btn-light-danger btn-sm"
                                  onClick={() => removeItem(it.idTemp)}
                                >
                                  <i className="bi bi-trash" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* === Vista MÓVIL (< md): lista vertical con títulos === */}
                  <div className="d-block d-md-none">
                    {items.map((it, idx) => {
                      const importe =
                        Number(it.precioItemProforma ?? 0) *
                        Number(it.cantidadItemProforma ?? 0);
                      return (
                        <div
                          key={it.idTemp}
                          className="border rounded-3 p-3 mb-3 bg-white shadow-sm"
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-light text-dark">
                              #{idx + 1}
                            </span>
                            <button
                              className="btn btn-icon btn-light-danger btn-sm"
                              onClick={() => removeItem(it.idTemp)}
                              aria-label="Eliminar ítem"
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </div>

                          <div className="mb-2">
                            <label className="form-label mb-1">Nombre</label>
                            <input
                              className="form-control form-control-sm"
                              ref={(el) => {
                                nombreRefs.current[it.idTemp] = el;
                              }}
                              value={it.nombreItemProforma}
                              onChange={(e) =>
                                patchItem(it.idTemp, {
                                  nombreItemProforma: e.target.value,
                                })
                              }
                              placeholder="Nombre del ítem"
                            />
                          </div>

                          <div className="mb-2">
                            <label className="form-label mb-1">
                              Descripción
                            </label>
                            <input
                              className="form-control form-control-sm"
                              value={it.descripcionItemProforma}
                              onChange={(e) =>
                                patchItem(it.idTemp, {
                                  descripcionItemProforma: e.target.value,
                                })
                              }
                              placeholder="Descripción (opcional)"
                            />
                          </div>

                          <div className="row g-2">
                            <div className="col-6">
                              <label className="form-label mb-1">P. Unit</label>
                              <input
                                type="number"
                                step="1"
                                min={0}
                                className="form-control form-control-sm text-end"
                                value={it.precioItemProforma ?? 0}
                                onWheel={(e) => e.currentTarget.blur()}
                                onKeyDown={(e) => {
                                  const blocked = ["-", "+", "e", "E"];
                                  if (
                                    blocked.includes(e.key) ||
                                    e.code === "NumpadSubtract"
                                  )
                                    e.preventDefault();
                                }}
                                onBeforeInput={(e: any) => {
                                  if (e?.data && /[-+eE]/.test(e.data))
                                    e.preventDefault();
                                }}
                                onPaste={(e) => {
                                  const txt = e.clipboardData.getData("text");
                                  const cleaned = txt
                                    .replace(/[^0-9.,]/g, "")
                                    .replace(",", ".");
                                  let num = Number(cleaned);
                                  if (Number.isNaN(num)) {
                                    e.preventDefault();
                                    return;
                                  }
                                  num = Math.max(0, num);
                                  patchItem(it.idTemp, {
                                    precioItemProforma: num,
                                  });
                                  e.preventDefault();
                                }}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(",", ".");
                                  if (raw === "") {
                                    patchItem(it.idTemp, {
                                      precioItemProforma: 0,
                                    });
                                    return;
                                  }
                                  let val = Number(raw);
                                  if (!Number.isFinite(val)) return;
                                  if (val < 0) val = 0;
                                  patchItem(it.idTemp, {
                                    precioItemProforma: val,
                                  });
                                }}
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label mb-1">Cant.</label>
                              <input
                                type="number"
                                step="1"
                                min={1}
                                className="form-control form-control-sm text-end"
                                value={it.cantidadItemProforma ?? 1}
                                onWheel={(e) => e.currentTarget.blur()}
                                onKeyDown={(e) => {
                                  const blocked = ["-", "+", "e", "E"];
                                  if (
                                    blocked.includes(e.key) ||
                                    e.code === "NumpadSubtract"
                                  )
                                    e.preventDefault();
                                }}
                                onBeforeInput={(e: any) => {
                                  if (e?.data && /[-+eE]/.test(e.data))
                                    e.preventDefault();
                                }}
                                onPaste={(e) => {
                                  const txt = e.clipboardData.getData("text");
                                  const cleaned = txt.replace(/[^0-9]/g, "");
                                  const num = Number(cleaned);
                                  if (Number.isNaN(num) || num < 1) {
                                    e.preventDefault();
                                    return;
                                  }
                                  patchItem(it.idTemp, {
                                    cantidadItemProforma: num,
                                  });
                                  e.preventDefault();
                                }}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(",", ".");
                                  if (raw === "") {
                                    patchItem(it.idTemp, {
                                      cantidadItemProforma: 1,
                                    });
                                    return;
                                  }
                                  let val = Number(raw);
                                  if (!Number.isFinite(val)) return;
                                  if (val < 1) val = 1;
                                  patchItem(it.idTemp, {
                                    cantidadItemProforma: val,
                                  });
                                }}
                              />
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <small className="text-muted">Importe</small>
                            <span className="fw-bold">
                              {importe.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totales */}
                  <div className="d-flex flex-column align-items-end mt-4">
                    <div className="w-100 w-md-50">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Subtotal</span>
                        <span className="fw-semibold">
                          {(totales.subTotal ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">
                          Descuento{" "}
                          {descuentoTipo === "Porcentaje"
                            ? `(${descuentoValor ?? 0}%)`
                            : ""}
                        </span>
                        <span className="fw-semibold">
                          - {(totales.montoDescuento ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          title="Subtotal con descuento"
                          className="text-muted"
                        >
                          Subtotal c/desc:
                        </span>
                        <span className="fw-semibold">
                          {(totales.baseImponible ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">IVA {impuesto ?? 0}%</span>
                        <span className="fw-semibold">
                          {(totales.montoImpuesto ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fs-4">
                        <span className="fw-bold">TOTAL</span>
                        <span className="fw-bold">
                          {(totales.totalCalculado ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Área PDF (offscreen, no display:none) */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  top: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  ref={printRef}
                  style={{ width: 794, background: "#fff", padding: 16 }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h3 className="mb-0">Proforma</h3>
                      <small>{dayjs(fechaP).format("DD/MM/YYYY")}</small>
                    </div>
                    {logoDataUrl && (
                      <img src={logoDataUrl} style={{ height: 60 }} />
                    )}
                  </div>
                  <div className="mb-2">
                    <strong>Cliente:</strong> {clienteOpt?.label ?? "-"}
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            borderBottom: "1px solid #ccc",
                          }}
                        >
                          Descripción
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            borderBottom: "1px solid #ccc",
                          }}
                        >
                          P. Unit
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            borderBottom: "1px solid #ccc",
                          }}
                        >
                          Cant.
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            borderBottom: "1px solid #ccc",
                          }}
                        >
                          Importe
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it.idTemp}>
                          <td>{it.nombreItemProforma}</td>
                          <td style={{ textAlign: "right" }}>
                            {Number(it.precioItemProforma ?? 0).toFixed(2)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {Number(it.cantidadItemProforma ?? 0)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {(
                              Number(it.precioItemProforma ?? 0) *
                              Number(it.cantidadItemProforma ?? 0)
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 8, marginLeft: "auto", width: 260 }}>
                    <div className="d-flex justify-content-between">
                      <span>Subtotal</span>
                      <span>{(totales.subTotal ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Descuento</span>
                      <span>- {(totales.montoDescuento ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>IVA</span>
                      <span>{(totales.montoImpuesto ?? 0).toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total</span>
                      <span>{(totales.totalCalculado ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer justify-content-between">
              <div className="text-muted">
                <i className="bi bi-info-circle me-2" />
                Los valores se recalculan automáticamente.
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-light" onClick={handlePdf}>
                  <i className="bi bi-filetype-pdf me-2" />
                  Generar PDF
                </button>
                <button className="btn btn-primary" onClick={handleGuardar}>
                  <i className="bi bi-save2 me-2" />
                  Guardar proforma
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// util local
async function toDataUrl(f: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(f);
  });
}
