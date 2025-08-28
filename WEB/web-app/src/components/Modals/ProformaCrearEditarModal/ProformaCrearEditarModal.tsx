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
import {
  DTO_Proforma,
  DTO_ProformaItem,
  DTO_Respuesta,
  DTO_Estado,
} from "@/models";
import { calcularTotales, TipoDescuento } from "@/utils/profromasHelpers";
import { formatColones, notificationHelpers, procesarRespuesta } from "@/utils";
import { proformaService } from "@/services/proformas.service";
import { items_proformaService } from "@/services";

// CONSTANTE de soft-delete para items
const PROFORMA_ITEM_DELETED = 30;

type Mode = "create" | "edit";

type Props = {
  show: boolean;
  mode: Mode;
  onClose: () => void;

  /** Solo para edición: suficiente pasar la fila de proforma */
  proforma?: DTO_Proforma | null;

  /** Opcional en edición: si ya tienes los items cargados en el padre, pásalos y se evita el fetch */
  itemsIniciales?: DTO_ProformaItem[] | null;

  /** Callbacks */
  onRegistered?: (nuevaProforma: DTO_Proforma) => void;
  onUpdated?: (proformaActualizada: DTO_Proforma) => void;
};

type ItemLocal = {
  idTemp: string;
  iD_ProformaItem?: number;
  iD_Tarifa?: number | null;
  nombreItemProforma: string;
  descripcionItemProforma: string;
  precioItemProforma?: number;
  cantidadItemProforma?: number;
  _isNew?: boolean;
  _dirty?: boolean;
  _deleted?: boolean;
};

export const ProformaCrearEditarModal = (props: Props) => {
  const {
    show,
    mode,
    onClose,
    proforma,
    itemsIniciales,
    onRegistered,
    onUpdated,
  } = props;
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

  // refs para foco/scroll
  const nombreRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Ítems
  const [items, setItems] = useState<ItemLocal[]>([
    {
      idTemp: uuid(),
      nombreItemProforma: "",
      descripcionItemProforma: "",
      precioItemProforma: 0,
      cantidadItemProforma: 1,
      _isNew: true,
    },
  ]);
  const [tarifaSel, setTarifaSel] = useState<TarifarioOption | null>(null);

  // === Hidratación en modo edición (carga cabecera + ítems si no vienen) ===
  useEffect(() => {
    if (mode !== "edit" || !proforma) return;

    // Cabecera
    setClienteOpt(
      proforma.cliente
        ? {
            value: Number(proforma.iD_Cliente),
            label:
              `${(proforma.cliente as any)?.nombreCliente ?? ""} ${
                (proforma.cliente as any)?.apellidoCliente ?? ""
              }`.trim() || String(proforma.iD_Cliente),
          }
        : {
            value: Number(proforma.iD_Cliente),
            label: String(proforma.iD_Cliente),
          }
    );
    setFechaP(dayjs(proforma.fechaProforma ?? new Date()).format("YYYY-MM-DD"));
    setFechaV(
      dayjs(proforma.fechaVencimiento ?? dayjs().add(15, "day")).format(
        "YYYY-MM-DD"
      )
    );
    setObservaciones(proforma.observacionProforma ?? "");
    setDescuentoTipo(
      proforma.descuentoPorcentualProforma ? "Porcentaje" : "Monto"
    );
    setDescuentoValor(proforma.descuentoProforma ?? undefined);
    setImpuesto(proforma.impuestoPorcentualProforma ?? undefined);

    // Ítems
    if (!itemsIniciales || !itemsIniciales.length) {
      const sub = items_proformaService
        .obtenerItemsProformas({
          iD_Proforma: proforma.iD_Proforma,
        } as DTO_Proforma)
        .subscribe({
          next: (r: DTO_Respuesta) => {
            const list =
              (procesarRespuesta(r) as unknown as DTO_ProformaItem[]) || [];
            const mapped: ItemLocal[] = list.map((x) => ({
              idTemp: uuid(),
              iD_ProformaItem: x.iD_ProformaItem,
              iD_Tarifa: undefined,
              nombreItemProforma: x.nombreItemProforma,
              descripcionItemProforma: x.descripcionItemProforma ?? "",
              precioItemProforma: Number(x.precioItemProforma ?? 0),
              cantidadItemProforma: Number(x.cantidadItemProforma ?? 1),
              _isNew: false,
              _dirty: false,
              _deleted: x.estado?.iD_Estado === PROFORMA_ITEM_DELETED,
            }));
            setItems(
              mapped.length
                ? mapped
                : [
                    {
                      idTemp: uuid(),
                      nombreItemProforma: "",
                      descripcionItemProforma: "",
                      precioItemProforma: 0,
                      cantidadItemProforma: 1,
                      _isNew: true,
                    },
                  ]
            );
          },
          error: () => {
            setItems([
              {
                idTemp: uuid(),
                nombreItemProforma: "",
                descripcionItemProforma: "",
                precioItemProforma: 0,
                cantidadItemProforma: 1,
                _isNew: true,
              },
            ]);
          },
        });
      return () => sub.unsubscribe?.();
    } else {
      const mapped = itemsIniciales.map((x) => ({
        idTemp: uuid(),
        iD_ProformaItem: x.iD_ProformaItem,
        iD_Tarifa: undefined,
        nombreItemProforma: x.nombreItemProforma,
        descripcionItemProforma: x.descripcionItemProforma ?? "",
        precioItemProforma: Number(x.precioItemProforma ?? 0),
        cantidadItemProforma: Number(x.cantidadItemProforma ?? 1),
        _isNew: false,
        _dirty: false,
        _deleted: false,
      }));
      setItems(mapped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, proforma?.iD_Proforma]);

  // foco al agregar item
  useEffect(() => {
    if (!lastAddedId) return;
    const id = lastAddedId;
    const t = requestAnimationFrame(() => {
      const input = nombreRefs.current[id];
      if (input) {
        input.focus({ preventScroll: true });
        const len = input.value.length;
        input.setSelectionRange?.(len, len);
        input.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    });
    setLastAddedId(null);
    return () => cancelAnimationFrame(t);
  }, [items, lastAddedId]);

  // Totales (solo ítems no eliminados)
  const itemsVigentes = useMemo(
    () => items.filter((i) => !i._deleted),
    [items]
  );
  const totales = useMemo(
    () =>
      calcularTotales(
        itemsVigentes,
        descuentoTipo,
        typeof descuentoValor === "number" ? descuentoValor : 0,
        typeof impuesto === "number" ? impuesto : 0
      ),
    [itemsVigentes, descuentoTipo, descuentoValor, impuesto]
  );

  // Fields cabecera (mantenemos tu patrón)
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
          className="form-control text-muted"
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
          className="form-control text-muted"
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
          className="form-control text-muted"
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
              className="form-control text-muted"
              value={descuentoValor ?? ""}
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                const blocked = ["-", "+", "e", "E"];
                if (blocked.includes(e.key) || e.code === "NumpadSubtract")
                  e.preventDefault();
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
                descuentoTipo === "Porcentaje"
                  ? "btn-primary "
                  : "btn-secondary pulse pulse-primary"
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
          className="form-control text-muted"
          value={impuesto ?? ""}
          min={0}
          max={100}
          step="1"
          inputMode="decimal"
          onWheel={(e) => e.currentTarget.blur()}
          onKeyDown={(e) => {
            const blocked = ["-", "+", "e", "E"];
            if (blocked.includes(e.key) || e.code === "NumpadSubtract")
              e.preventDefault();
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
  ];

  // Handlers de ítems
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
        _isNew: true,
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
        _isNew: true,
      },
    ]);
    setLastAddedId(id);
  }

  function patchItem(idTemp: string, patch: Partial<ItemLocal>) {
    setItems((prev) =>
      prev.map((i) =>
        i.idTemp === idTemp ? { ...i, ...patch, _dirty: true } : i
      )
    );
  }

  /** En edición se hace soft-delete (toggle); en creación se remueve */
  function removeOrToggleDelete(idTemp: string) {
    setItems(
      (prev) =>
        prev
          .map((i) => {
            if (i.idTemp !== idTemp) return i;
            if (mode === "edit" && i.iD_ProformaItem) {
              return { ...i, _deleted: !i._deleted, _dirty: true };
            }
            return null; // en create se elimina realmente
          })
          .filter(Boolean) as ItemLocal[]
    );
    delete nombreRefs.current[idTemp];
  }

  // helper de reset 
  function resetForm() {
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
        _isNew: true,
      },
    ]);
  }

  // resetea al abrir (solo en create)
  const prevShowRef = useRef(false);
  useEffect(() => {
    if (mode === "create" && show && !prevShowRef.current) {
      resetForm();
    }
    prevShowRef.current = show;
  }, [show, mode]);

  // Guardar
  //Esta validación es básica, se mejorará usando las validaciones que ya tenemos con el dto_validator
  async function handleGuardar() {
    if (!clienteOpt?.value) {
      notificationHelpers.warningAlert("Seleccione un cliente.");
      return;
    }
    if (!itemsVigentes.length) {
      notificationHelpers.warningAlert("Agregue al menos un ítem.");
      return;
    }
    if (
      itemsVigentes.some(
        (i) => !i.nombreItemProforma || Number(i.cantidadItemProforma ?? 0) <= 0
      )
    ) {
      notificationHelpers.warningAlert(
        "Verifique nombre y cantidad (>0) en los ítems."
      );
      return;
    }

    const dtoCabecera: DTO_Proforma = {
      iD_Proforma: mode === "edit" ? Number(proforma?.iD_Proforma ?? 0) : 0,
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

    try {
      if (mode === "create") {
        const r = await proformaService
          .registrarProformas(dtoCabecera)
          .toPromise();
        if (!r)
          throw new Error("No se obtuvo respuesta del registro de proforma.");
        const parsed = procesarRespuesta(r as DTO_Respuesta) as DTO_Proforma;
        const idProforma = parsed.iD_Proforma;
        if (!idProforma) throw new Error("No se obtuvo el ID de la proforma.");

        for (const it of itemsVigentes) {
          const dti: DTO_ProformaItem = {
            iD_ProformaItem: 0,
            iD_Proforma: idProforma,
            estado: undefined as any,
            nombreItemProforma: it.nombreItemProforma,
            descripcionItemProforma: it.descripcionItemProforma,
            precioItemProforma: Number(it.precioItemProforma ?? 0),
            cantidadItemProforma: Number(it.cantidadItemProforma ?? 0),
          };
          const r2 = await items_proformaService
            .registrarItemProforma(dti)
            .toPromise();
          if (!r2?.tipoRespuesta)
            throw new Error(r2?.mensaje ?? "Error al registrar item.");
        }

        notificationHelpers.successAlert("Proforma registrada correctamente.");
        const nuevaProforma = {
          ...parsed,
          cliente: { nombreCliente: clienteOpt.label } as any,
          subTotal: totales.subTotal,
          montoDescuento: totales.montoDescuento,
          baseImponible: totales.baseImponible,
          montoImpuesto: totales.montoImpuesto,
          totalCalculado: totales.totalCalculado,
          descuentoProforma: dtoCabecera.descuentoProforma,
          impuestoPorcentualProforma: dtoCabecera.impuestoPorcentualProforma,
        };
        onRegistered?.(nuevaProforma);
        return;
      }

      // ===== EDITAR =====
      const r0 = await proformaService
        .actualizarProformas(dtoCabecera)
        .toPromise();
      if (!r0?.tipoRespuesta)
        throw new Error(r0?.mensaje ?? "Error al actualizar proforma.");
      const nuevos = items.filter((i) => i._isNew && !i._deleted);
      const modificados = items.filter(
        (i) => !i._isNew && i._dirty && !i._deleted && i.iD_ProformaItem
      );
      const eliminados = items.filter(
        (i) => !i._isNew && i._deleted && i.iD_ProformaItem
      );

      // crear nuevos
      for (const it of nuevos) {
        const dti: DTO_ProformaItem = {
          iD_ProformaItem: 0,
          iD_Proforma: Number(proforma?.iD_Proforma),
          estado: undefined as any,
          nombreItemProforma: it.nombreItemProforma,
          descripcionItemProforma: it.descripcionItemProforma,
          precioItemProforma: Number(it.precioItemProforma ?? 0),
          cantidadItemProforma: Number(it.cantidadItemProforma ?? 0),
        };
        const rN = await items_proformaService
          .registrarItemProforma(dti)
          .toPromise();
        if (!rN?.tipoRespuesta)
          throw new Error(rN?.mensaje ?? "Error al crear ítem.");
      }

      // actualizar modificados
      for (const it of modificados) {
        const dti: DTO_ProformaItem = {
          iD_ProformaItem: Number(it.iD_ProformaItem),
          iD_Proforma: Number(proforma?.iD_Proforma),
          estado: undefined as any,
          nombreItemProforma: it.nombreItemProforma,
          descripcionItemProforma: it.descripcionItemProforma,
          precioItemProforma: Number(it.precioItemProforma ?? 0),
          cantidadItemProforma: Number(it.cantidadItemProforma ?? 0),
        };
        const rU = await items_proformaService
          .actualizarItemProforma(dti)
          .toPromise();
        if (!rU?.tipoRespuesta)
          throw new Error(rU?.mensaje ?? "Error al actualizar ítem.");
      }

      // soft-delete (estado = 30) usando actualizarItemProforma
      for (const it of eliminados) {
        const dti: DTO_ProformaItem = {
          iD_ProformaItem: Number(it.iD_ProformaItem),
          iD_Proforma: Number(proforma?.iD_Proforma),
          estado: { iD_Estado: PROFORMA_ITEM_DELETED } as DTO_Estado,
          nombreItemProforma: it.nombreItemProforma,
          descripcionItemProforma: it.descripcionItemProforma,
          precioItemProforma: Number(it.precioItemProforma ?? 0),
          cantidadItemProforma: Number(it.cantidadItemProforma ?? 0),
        };
        const rD = await items_proformaService
          .actualizarItemProforma(dti)
          .toPromise();
        if (!rD?.tipoRespuesta)
          throw new Error(rD?.mensaje ?? "Error al eliminar ítem.");
      }
      //preparamos una respuesta coerente para el padre, con los totales actualizados
      const proformaActualizadaParaTabla: DTO_Proforma = {
        ...(proforma as DTO_Proforma),
        ...dtoCabecera,
        subTotal: totales.subTotal,
        montoDescuento: totales.montoDescuento,
        baseImponible: totales.baseImponible,
        montoImpuesto: totales.montoImpuesto,
        totalCalculado: totales.totalCalculado,
        descuentoProforma: dtoCabecera.descuentoProforma,
        impuestoPorcentualProforma: dtoCabecera.impuestoPorcentualProforma,
        cliente: { nombreCliente: clienteOpt?.label ?? "" } as any,
      };

      notificationHelpers.successAlert("Proforma actualizada correctamente.");
      onUpdated?.(proformaActualizadaParaTabla);
   
    } catch (err: any) {
      notificationHelpers.errorAlert(
        err?.message ?? "Ocurrió un error al guardar."
      );
    }
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
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Fullscreen en sm-down para UX móvil */}
        <div className="modal-dialog modal-fullscreen-sm-down modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {mode === "edit"
                  ? `Editar Proforma : #${proforma?.iD_Proforma}`
                  : "Nueva Proforma"}
              </h5>
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
                    <label className="text-muted fs-5 mb-1">{f.label}</label>
                    {f.renderer?.({ value: null, onChange: () => {} })}
                  </div>
                ))}
              </div>

              {/* Ítems */}
              <div className="card mt-6">
                <div className="card-header p-1 pb-0 ">
                  <div className="card-title text-muted ">Ítems</div>
                </div>
                <div className="card-body p-0 pt-3">
                  {/* Tarifa + botón agregar (input izq, botón der pegado) */}
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

                  {/* === Desktop (≥ md): tabla clásica === */}
                  <div className="table-responsive d-none d-md-block">
                    <table className="table align-middle table-row-dashed gy-2">
                      <thead>
                        <tr className="fw-semibold text-muted">
                          <th style={{ width: 48 }}>#</th>
                          <th>Nombre</th>
                          <th>Descripción</th>
                          <th className="text-end" style={{ width: 140 }}>
                            Precio
                          </th>
                          <th className="text-end" style={{ width: 120 }}>
                            Cantidad
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
                          const rowClass = it._deleted
                            ? "opacity-50 text-decoration-line-through"
                            : "";
                          return (
                            <tr key={it.idTemp} className={rowClass}>
                              <td>{idx + 1}</td>
                              <td>
                                <input
                                  className="form-control text-muted form-control-sm"
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
                                  disabled={it._deleted}
                                />
                              </td>
                              <td>
                                <input
                                  className="form-control text-muted form-control-sm"
                                  value={it.descripcionItemProforma}
                                  onChange={(e) =>
                                    patchItem(it.idTemp, {
                                      descripcionItemProforma: e.target.value,
                                    })
                                  }
                                  placeholder="Descripción (opcional)"
                                  disabled={it._deleted}
                                />
                              </td>
                              <td className="text-end">
                                <input
                                  type="number"
                                  step="1"
                                  min={0}
                                  className="form-control text-muted form-control-sm text-end"
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
                                  disabled={it._deleted}
                                />
                              </td>
                              <td className="text-end">
                                <input
                                  type="number"
                                  step="1"
                                  min={1}
                                  className="form-control text-muted form-control-sm text-end"
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
                                  disabled={it._deleted}
                                />
                              </td>
                              <td className="text-end">
                                <span className="text-muted">
                                  {formatColones(importe.toFixed(2))}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className={`btn btn-icon btn-sm ${
                                    it._deleted
                                      ? "btn-light-warning"
                                      : "btn-light-danger"
                                  }`}
                                  onClick={() =>
                                    removeOrToggleDelete(it.idTemp)
                                  }
                                  title={
                                    it._deleted
                                      ? "Restaurar ítem"
                                      : "Eliminar ítem"
                                  }
                                >
                                  <i
                                    className={`bi ${
                                      it._deleted
                                        ? "bi-arrow-counterclockwise"
                                        : "bi-trash"
                                    }`}
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* === Móvil (< md): tarjetas === */}
                  <div className="d-block d-md-none">
                    {items.map((it, idx) => {
                      const importe =
                        Number(it.precioItemProforma ?? 0) *
                        Number(it.cantidadItemProforma ?? 0);
                      const cardCls = it._deleted ? "opacity-50" : "";
                      return (
                        <div
                          key={it.idTemp}
                          className={`border rounded-3 p-3 mb-3 w-100 ${cardCls}`}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-light text-dark">
                              #{idx + 1}
                            </span>
                            {it._deleted && (
                              <span className="badge bg-warning text-dark me-2">
                                Eliminado
                              </span>
                            )}
                            <button
                              className={`btn btn-icon btn-sm ${
                                it._deleted
                                  ? "btn-light-warning"
                                  : "btn-light-danger"
                              }`}
                              onClick={() => removeOrToggleDelete(it.idTemp)}
                              aria-label={
                                it._deleted ? "Restaurar ítem" : "Eliminar ítem"
                              }
                            >
                              <i
                                className={`bi ${
                                  it._deleted
                                    ? "bi-arrow-counterclockwise"
                                    : "bi-trash"
                                }`}
                              />
                            </button>
                          </div>
                          <div className="mb-2">
                            <label className="text-muted mb-1">Nombre</label>
                            <input
                              className="form-control text-muted form-control-sm"
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
                              disabled={it._deleted}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="text-muted mb-1">
                              Descripción
                            </label>
                            <input
                              className="form-control text-muted form-control-sm"
                              value={it.descripcionItemProforma}
                              onChange={(e) =>
                                patchItem(it.idTemp, {
                                  descripcionItemProforma: e.target.value,
                                })
                              }
                              placeholder="Descripción (opcional)"
                              disabled={it._deleted}
                            />
                          </div>
                          <div className="row g-2">
                            <div className="col-6">
                              <label className="text-muted mb-1">Precio</label>
                              <input
                                type="number"
                                step="1"
                                min={0}
                                className="form-control text-muted form-control-sm text-end"
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
                                disabled={it._deleted}
                              />
                            </div>
                            <div className="col-6">
                              <label className="text-muted mb-1">
                                Cantidad
                              </label>
                              <input
                                type="number"
                                step="1"
                                min={1}
                                className="form-control text-muted form-control-sm text-end"
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
                                disabled={it._deleted}
                              />
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <small className="text-muted">Importe</small>
                            <span className="text-muted">
                              {formatColones(importe.toFixed(2))}
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
                        <span className="text-muted">
                          {formatColones(totales.subTotal ?? 0)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">
                          Descuento{" "}
                          {descuentoTipo === "Porcentaje"
                            ? `(${descuentoValor ?? 0}%)`
                            : ""}
                        </span>
                        <span className="text-muted">
                          - {formatColones(totales.montoDescuento ?? 0)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          title="Subtotal con descuento"
                          className="text-muted"
                        >
                          Subtotal c/desc:
                        </span>
                        <span className="text-muted">
                          {formatColones(totales.baseImponible ?? 0)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">IVA {impuesto ?? 0}%</span>
                        <span className="text-muted">
                          {formatColones(totales.montoImpuesto ?? 0)}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fs-4">
                        <span className="fw-bold">TOTAL</span>
                        <span className="fw-bold">
                          {formatColones(totales.totalCalculado ?? 0)}
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
                  {/* Puedes reutilizar la tabla simple aquí si quieres exportar detalle */}
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
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGuardar}
                >
                  <i className="bi bi-save2 me-2" />
                  {mode === "edit" ? "Actualizar proforma" : "Guardar proforma"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
