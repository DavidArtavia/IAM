import {
  AsyncClientSelect,
  ClientOption,
  ConfirmModal,
  DetalleCuentaInput,
  FieldConfig,
  GenericDataTable,
  GenericFormModal,
  InfoModal,
  ItemsOrdenDeServicioModal,
  ReferenciaCards,
} from "@/components";
import ReactDOM from "react-dom/client";
import {
  RESTRICCIONES,
  STATUS_ORDEN_SERVICIO_OPTIONS,
  STATUS_TBL,
} from "@/constants";
import {
  DTO_Cuenta,
  DTO_ItemOrdenServicio,
  DTO_Negocio,
  DTO_OrdenServicio,
  DTO_Respuesta,
} from "@/models";
import {
  cuentasService,
  itemsOrdenesService,
  ordenesService,
} from "@/services";
import {
  keysInfoModalOrdenDeServicio,
  columnKeysOrdenDeServicio,
  dateHelpers,
  errorHelpers,
  labelMapOrdenDeServicio,
  notificationHelpers,
  ordenServicioFormEditFields,
  parametrosAString,
  ordenservicioFormCrearCuenta,
} from "@/utils";
import { useApp } from "@/hooks/useApp";

import { useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";

// #region 🔑 Helpers
const generateSafeKey = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
// #endregion

export const OrdenDeServicio = () => {
  // #region 🔄 Estado general
  const { state } = useApp();

  useEffect(() => {
    if (state.negocio) {
      setSelectedBusiness(state.negocio);
      handleSelectBusiness(state.negocio);
    }
  }, [state]);

  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(null);
  const [ordenes, setOrdenes] = useState<DTO_OrdenServicio[]>([]);
  const [disableButtonAdd, setDisableButtonAdd] = useState(true);
  //#endregion

  // #region 🧩 Negocio seleccionado
  const handleSelectBusiness = (neg: DTO_Negocio) => {
    setSelectedBusiness(neg);
    setDisableButtonAdd(false);
  };
  //#endregion

  // #region 🚀 Obtener órdenes
  useEffect(() => {
    if (!selectedBusiness) return;
    const sub = ordenesService
      .obtenerOrdensDeServicio(selectedBusiness)
      .subscribe({
        next: (res) =>
          setOrdenes(
            ((res as DTO_Respuesta).resultado as DTO_OrdenServicio[]) || []
          ),
        error: errorHelpers.serverError,
      });
    return () => sub.unsubscribe();
  }, [selectedBusiness]);
  //#endregion

  // #region ➕ Crear Orden
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_OrdenServicio>(() => {
    const dto = new DTO_OrdenServicio();
    dto.fechaInicio = null;
    dto.fechaFinal = null;
    dto.fechaEntrega = null;
    dto.fechaEstimadaEntrega = null;
    return dto;
  });
  const [selectedClientOption, setSelectedClientOption] = useState<ClientOption | null>(null);

  const handleAddNew = () => {
    if (!selectedBusiness) return;
    const initial = new DTO_OrdenServicio();
    initial.referenciaJSON =
      selectedBusiness.referenciaJSON?.map((r) => ({
        nombre: r.nombre,
        valor: "",
      })) || [];
    initial.fechaInicio = null;
    initial.fechaFinal = null;
    initial.fechaEntrega = null;
    initial.fechaEstimadaEntrega = null;
    setFormData(initial);
    setSelectedClientOption(null);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!selectedBusiness) return;
    const toSave: any = { ...formData };
    toSave.iD_Negocio = selectedBusiness.iD_Negocio;
    toSave.fechaOrdenServicio = new Date();

    [
      "fechaInicio",
      "fechaFinal",
      "fechaEntrega",
      "fechaEstimadaEntrega",
    ].forEach((key) => {
      const raw = (toSave[key] as string | null) ?? null;
      if (raw) {
        const d = new Date(raw);
        toSave[key] = !isNaN(d.getTime()) && d.getFullYear() >= 1753 ? d : null;
      } else {
        toSave[key] = null;
      }
    });

    ordenesService.registrarOrdensDeServicio(toSave).subscribe({
      next: (res) => {
        notificationHelpers.successAlert((res as DTO_Respuesta).mensaje);
        setIsFormOpen(false);
        setOrdenes((prev) => [
          ...((res as DTO_Respuesta).resultado as DTO_OrdenServicio[]),
          ...prev,
        ]);
      },
      error: errorHelpers.serverError,
    });
  };

  const handleCancelAdd = () => {
    setConfirmModalMessage(
      "¿Estás seguro de que deseas cancelar la nueva orden?"
    );
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };

  // Campos personalizados para crear
  const buildRefFields = (item: DTO_OrdenServicio) =>
    item.referenciaJSON?.map((r, idx) => ({
      key: generateSafeKey(r.nombre) as keyof DTO_OrdenServicio,
      label: r.nombre,
      type: "custom" as const,
      renderer: () => (
        <input
          className="form-control"
          value={item.referenciaJSON?.[idx].valor || ""}
          onChange={(e) => {
            const arr = [...(item.referenciaJSON || [])];
            arr[idx] = { nombre: r.nombre, valor: e.target.value };
            if (item === formData) {
              setFormData({ ...item, referenciaJSON: arr });
            } else {
              setEditData({ ...item, referenciaJSON: arr });
            }
          }}
        />
      ),
    })) || [];

  const newFormFields: FieldConfig<DTO_OrdenServicio>[] = [
    ...ordenServicioFormEditFields,
    {
      key: "iD_Cliente",
      label: "Cliente",
      type: "custom",
      required: true,
      renderer: ({ onChange }) => (
        <AsyncClientSelect
          value={selectedClientOption}
          onChange={(opt) => {
            setSelectedClientOption(opt);
            onChange(opt?.value || 0);
          }}
        />
      ),
    },
    ...buildRefFields(formData),
  ];
  //#endregion

  // #region ✏️ Editar Orden
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<DTO_OrdenServicio>(() => {
    const dto = new DTO_OrdenServicio();
    dto.fechaInicio = null;
    dto.fechaFinal = null;
    dto.fechaEntrega = null;
    dto.fechaEstimadaEntrega = null;
    return dto;
  });

  const normalizeIncomingDate = (raw?: string | Date | null): string | null => {
    if (!raw) return null;
    const date = typeof raw === "string" ? new Date(raw) : raw;
    if (
      !(date instanceof Date) ||
      isNaN(date.getTime()) ||
      date.getFullYear() < 1753
    )
      return null;
    return typeof raw === "string" ? raw : date.toISOString();
  };

  const handleEdit = (row: DTO_OrdenServicio) => {
    const cleanedNote = row.notaOrdenServicio?.split("|").pop()?.trim() || "";
    const copy: any = {
      ...row,
      notaOrdenServicio: cleanedNote,
      iD_Negocio: row.iD_Negocio,
      fechaInicio: normalizeIncomingDate(row.fechaInicio),
      fechaFinal: normalizeIncomingDate(row.fechaFinal),
      fechaEntrega: normalizeIncomingDate(row.fechaEntrega),
      fechaEstimadaEntrega: normalizeIncomingDate(row.fechaEstimadaEntrega),
    };
    const clienteMatch = row.notaOrdenServicio?.match(/Cliente:\s*([^|]+)/);
    const clienteNombre = clienteMatch ? clienteMatch[1].trim() : "";
    setSelectedClientOption({
      value: row.iD_Cliente || 0,
      label: clienteNombre,
    });
    setEditData(copy);
    setShowEditForm(true);
  };

  // Campos personalizados para editar
  const editFormFields: FieldConfig<DTO_OrdenServicio>[] = [
    ...ordenServicioFormEditFields,

    {
      key: "notaOrdenServicio",
      label: labelMapOrdenDeServicio["notaOrdenServicio"] ?? "Nota",
      type: "text",
      required: false,
      order: 4,
    },
    {
      key: "iD_Cliente",
      label: "Cliente",
      type: "custom",
      required: true,
      renderer: ({ onChange }) => (
        <AsyncClientSelect
          value={selectedClientOption}
          onChange={(opt) => {
            setSelectedClientOption(opt);
            onChange(opt?.value || 0);
          }}
        />
      ),
    },
    {
      key: "estado",
      label: "Estado de la orden",
      type: "custom",
      required: true,
      renderer: ({ value, onChange }) => {
        const selectedOption = value?.iD_Estado
          ? { value: value.iD_Estado, label: value.nombre || "" }
          : null;
        return (
          <AsyncSelect
            cacheOptions
            defaultOptions={STATUS_ORDEN_SERVICIO_OPTIONS}
            placeholder="Seleccione un estado"
            value={selectedOption}
            onChange={(opt) =>
              onChange({ iD_Estado: opt?.value, nombre: opt?.label })
            }
            loadOptions={async (inputValue) =>
              STATUS_ORDEN_SERVICIO_OPTIONS.filter((opt) =>
                opt.label.toLowerCase().includes(inputValue.toLowerCase())
              )
            }
            isDisabled={
              editData?.estado?.nombre === "Archivado" ||
              editData?.estado?.iD_Estado === STATUS_TBL.ORDER_SERVICE.ARCHIVED
            }
          />
        );
      },
    },
    ...buildRefFields(editData),
  ];

  const handleSaveEdit = () => {
    if (!selectedBusiness) return;
    const sanitized: any = { ...editData };
    sanitized.iD_Negocio = selectedBusiness.iD_Negocio;

    [
      "fechaInicio",
      "fechaFinal",
      "fechaEntrega",
      "fechaEstimadaEntrega",
    ].forEach((key) => {
      const raw = sanitized[key] ?? null;
      const d = raw ? dateHelpers.parseDateInput(raw) : null;
      sanitized[key] =
        d && d.getFullYear() >= RESTRICCIONES.MIN_ANNO_PERMITIDO ? d : null;
    });

    setOrdenes((prev) =>
      prev.map((o) =>
        o.iD_OrdenServicio === sanitized.iD_OrdenServicio ? sanitized : o
      )
    );

    ordenesService.actualizarOrdensDeServicio(sanitized).subscribe({
      next: (res: DTO_Respuesta) => {
        notificationHelpers.successAlert(res.mensaje);
        setShowEditForm(false);
      },
      error: errorHelpers.serverError,
    });
  };
  //#endregion

  // #region 🗑 Eliminar Orden
  const [orderToDelete, setOrderToDelete] = useState<DTO_OrdenServicio | null>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<"cancelAdd" | "delete" | null>(null);

  const handleDelete = (row: DTO_OrdenServicio) => {
    setConfirmModalMessage(
      `¿Estás seguro de que deseas eliminar la orden ${row.notaOrdenServicio}?`
    );
    setOrderToDelete(row);
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = (action: boolean | null) => {
    if (action && orderToDelete) {
      const updated: DTO_OrdenServicio = {
        ...orderToDelete,
        estado: {
          ...orderToDelete.estado!,
          iD_Estado: STATUS_TBL.ORDER_SERVICE.DELETED,
        },
      };

      const dateKeys = [
        "fechaInicio",
        "fechaFinal",
        "fechaEntrega",
        "fechaEstimadaEntrega",
      ];
      const sanitized: any = { ...updated };

      dateKeys.forEach((key) => {
        const raw = sanitized[key] ?? null;
        const date = raw ? new Date(raw) : null;
        sanitized[key] =
          !date || isNaN(date.getTime()) || date.getFullYear() < 1753
            ? null
            : date;
      });

      setOrdenes((prev) =>
        prev.map((o) =>
          o.iD_OrdenServicio === sanitized.iD_OrdenServicio ? sanitized : o
        )
      );

      ordenesService.actualizarOrdensDeServicio(sanitized).subscribe({
        next: (res) => notificationHelpers.infoAlert(res?.mensaje),
        error: errorHelpers.serverError,
      });
    }
    setOrderToDelete(null);
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };
  //#endregion

  // #region ⚡ Confirm Modal
  const confirmModalAcion = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsFormOpen(false);
        notificationHelpers.infoAlert("Nueva Orden descartada correctamente");
      } else if (confirmContext === "delete") {
        handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };
  //#endregion

  // #region 🧩 Ítems de Orden
  const [showItemsOrdenFormModal, setShowItemsOrdenFormModal] = useState(false);
  const [dataToItemsOrder, setDataToItemsOrder] = useState<DTO_OrdenServicio | null>(null);
  //#endregion

  // #region 🧱 Referencias y Renderers
  const customRenderers = {
    fechaOrdenServicio: (val: unknown) =>
      val ? new Date(String(val)).toLocaleDateString() : "",
    fechaEstimadaEntrega: (val: unknown) =>
      val ? new Date(String(val)).toLocaleDateString() : "",
  };

  const referenciaJSONColumn = {
    title: labelMapOrdenDeServicio["referenciaJSON"],
    data: null,
    orderable: true,
    searchable: true,
    defaultContent: "",
    render: function (_data: unknown, type: string, row: DTO_Negocio) {
      const esExport =
        type === "export" || type === "filter" || type === "sort";

      if (esExport && Array.isArray(row.referenciaJSON)) {
        return parametrosAString(row.referenciaJSON);
      }

      return "";
    },
    createdCell: (cell: Node, _data: unknown, row: DTO_Negocio) => {
      try {
        const container = document.createElement("div");
        const htmlCell = cell as HTMLElement;
        htmlCell.innerHTML = "";
        container.classList.add("w-100");
        ReactDOM.createRoot(container).render(
          <ReferenciaCards items={row.referenciaJSON || []} />
        );
        htmlCell.appendChild(container);
      } catch (err) {
        console.warn("Error ref JSON", err);
      }
    },
  };
  //#endregion

  // #region 🧠 Memo tabla
  const { data, labelMap } = useMemo(() => {
    const referenceMap = new Map<string, string>();
    ordenes.forEach((o) => {
      o.referenciaJSON?.forEach((r) => {
        referenceMap.set(r.nombre, generateSafeKey(r.nombre));
      });
    });

    // ✅ Filtrar órdenes eliminadas
    const ordenesActivas = ordenes.filter(
      (o) => o.estado?.iD_Estado !== STATUS_TBL.ORDER_SERVICE.DELETED
    );

    const prepared = ordenesActivas.map((o) => {
      const copy: any = { ...o };
      o.referenciaJSON?.forEach(
        (r) => (copy[referenceMap.get(r.nombre)!] = r.valor)
      );
      return copy;
    });

    const extLabelMap = { ...labelMapOrdenDeServicio };
    referenceMap.forEach((safe, raw) => {
      extLabelMap[safe] = raw;
    });

    return {
      data: prepared,
      labelMap: extLabelMap,
    };
  }, [ordenes]);
  //#endregion

  // #region ℹ️ Info Modal
  const [rowTableSelected, setRowTableSelected] = useState<DTO_OrdenServicio>();
  const infoModalFields: FieldConfig<DTO_OrdenServicio>[] = [
    ...keysInfoModalOrdenDeServicio,
    {
      key: "referenciaJSON",
      label: "Referencias",
      type: "custom",
      order: 9,
      renderer: ({ value }) => <ReferenciaCards items={value ?? []} />,
    },
  ];
  //#endregion

  // #region 🏦 Crear Cuenta de Orden de Servicio
  const [account, setAccount] = useState<DTO_Cuenta>();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [detalleHabilitado, setDetalleHabilitado] = useState<boolean>(!!account?.detalleJSON);
  const [montoInput, setMontoInput] = useState<string>(
    account?.monto && account?.monto !== 0 ? String(account?.monto) : ""
  );

  const getItemsToOrderServiceAccount = (
    rowData: DTO_OrdenServicio
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!rowData) return resolve();

      const request = {
        iD_OrdenServicio: rowData.iD_OrdenServicio,
      } as DTO_ItemOrdenServicio;

      itemsOrdenesService.obtenerItemsOrdensDeServicio(request).subscribe({
        next: (result: DTO_Respuesta) => {
          if (!result.tipoRespuesta) {
            notificationHelpers.errorAlert(
              result.mensaje || "Error al cargar ítems"
            );
            return reject();
          }

          const raw = result.resultado?.[0];
          const items = Array.isArray(raw)
            ? (raw as DTO_ItemOrdenServicio[])
            : [];

          const cuenta: DTO_Cuenta = {
            ...new DTO_Cuenta(),
            iD_Negocio: rowData.iD_Negocio ?? 0,
            iD_OrdenServicio: rowData.iD_OrdenServicio,
            tipoCuenta: "Cuenta Por Cobrar",
            concepto: `Cuenta por cobrar de la orden de servicio #${rowData.iD_OrdenServicio}`,
            monto: items.reduce(
              (acc, item) =>
                acc +
                (typeof item.monto === "number"
                  ? item.monto
                  : parseFloat(item.monto ?? "0")),
              0
            ),
            detalleJSON: {
              filas: items.map((item) => ({
                nombre:
                  item.nombreItemOrdenServicio ||
                  `Item ${item.iD_ItemOrdenServicio}`,
                valor:
                  typeof item.monto === "string"
                    ? item.monto
                    : item.monto?.toString() || "0.00",
              })),
              descuento: { nombre: "Descuento", valor: "0" },
              impuesto: { nombre: "Impuesto", valor: "0" },
            },
          };

          setAccount(cuenta);
          resolve();
        },
        error: (err) => {
          errorHelpers.serverError(err);
          reject(err);
        },
      });
    });
  };

  const formCreateAccountFields: FieldConfig<any>[] = [
    ...ordenservicioFormCrearCuenta,
    ...(account?.iD_OrdenServicio
      ? [
          {
            key: "iD_OrdenServicio",
            label: "Orden De Servicio #",
            type: "text",
            readOnly: true,
            order: 4,
          } as FieldConfig<any>,
        ]
      : []),
    {
      key: "tipoCuenta",
      label: "Tipo de Cuenta",
      type: "custom",
      required: false,
      order: 4,
      readOnly: true,
      renderer: ({ value }) => (
        <input
          className="form-control"
          value={value || "Cuenta Por Cobrar"}
          readOnly
          disabled
        />
      ),
    },
    {
      key: "detalleJSON",
      label: "Detalle",
      type: "custom",
      required: detalleHabilitado,
      order: 10,
      errorMessage:
        "Tienes datos sin agregar. Presiona el botón ➕ antes de continuar.",
      renderer: ({ value, onChange }) => (
        <DetalleCuentaInput
          value={value}
          onChange={onChange}
          monto={account?.monto ?? 0}
          setMonto={(val) => {
            setMontoInput(val !== 0 ? String(val) : "");
            setAccount((prev) => (prev ? { ...prev, monto: val } : undefined));
          }}
          onEnabledChange={(enabled) => setDetalleHabilitado(enabled)}
        />
      ),
    },
    {
      key: "monto",
      label: "Monto",
      type: "custom",
      required: !detalleHabilitado,
      order: 11,
      renderer: () => {
        return (
          <div className="input-group">
            <span className="input-group-text">₡</span>
            <input
              type="text"
              className={`form-control fw-bold fs-5 text-start ${
                detalleHabilitado ? "bg-light" : ""
              }`}
              readOnly={detalleHabilitado}
              value={
                montoInput !== ""
                  ? montoInput
                  : account?.monto !== undefined && account?.monto !== 0
                  ? String(account.monto)
                  : ""
              }
              onFocus={() => {
                if ((account?.monto || 0) === 0) {
                  setMontoInput("");
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setMontoInput(val);
                const num = parseFloat(val);
                setAccount((prev) =>
                  prev ? { ...prev, monto: isNaN(num) ? 0 : num } : undefined
                );
              }}
              onBlur={(e) => {
                const val = e.target.value;
                if (val === "" || isNaN(Number(val))) {
                  setMontoInput("");
                  setAccount((prev) =>
                    prev ? { ...prev, monto: 0 } : undefined
                  );
                }
              }}
              placeholder="₡0.00"
              min={0}
              step={0.01}
            />
          </div>
        );
      },
    },
  ];

  const handleCreateAccount = (cuenta: DTO_Cuenta) => {
    if (!cuenta.iD_Negocio || !cuenta.iD_OrdenServicio) {
      notificationHelpers.errorAlert("Negocio o Orden de Servicio no válidos");
      return;
    }

    cuentasService.registrarCuenta(cuenta).subscribe({
      next: (res: DTO_Respuesta) => {
        notificationHelpers.successAlert(res.mensaje);
        setShowCreateAccount(false);

        const ordenToUpdate = {
          ...editData,
          estado: {
            ...editData.estado,
            iD_Estado: STATUS_TBL.ORDER_SERVICE.ARCHIVED,
            nombre: "Archivado",
          },
        } as DTO_OrdenServicio;

        ordenesService.actualizarOrdensDeServicio(ordenToUpdate).subscribe({
          next: (updateRes: DTO_Respuesta) => {
            notificationHelpers.successAlert(
              "la Orden fue archivada correctamente"
            );

            let updatedOrden: DTO_OrdenServicio;

            if (
              Array.isArray(updateRes.resultado) &&
              updateRes.resultado.length > 0
            ) {
              updatedOrden = updateRes.resultado[0] as DTO_OrdenServicio;
            } else if (
              updateRes.resultado &&
              typeof updateRes.resultado === "object" &&
              !Array.isArray(updateRes.resultado)
            ) {
              updatedOrden = updateRes.resultado as DTO_OrdenServicio;
            } else {
              updatedOrden = ordenToUpdate;
            }
            
            setOrdenes((prev) =>
              prev.map((o) =>
                o.iD_OrdenServicio === updatedOrden.iD_OrdenServicio
                  ? {
                      ...o,
                      ...updatedOrden,
                    }
                  : o
              )
            );
            
            setEditData(updatedOrden);
          },
          error: errorHelpers.serverError,
        });
      },
      error: errorHelpers.serverError,
    });
  };

  // Método para manejar la acción de crear cuenta, reutilizable para editar y ver info
  const handleCreateAccountButton = (orden: DTO_OrdenServicio | undefined) => {
    if (
      orden?.estado?.nombre === "Archivado" ||
      orden?.estado?.iD_Estado === STATUS_TBL.ORDER_SERVICE.ARCHIVED
    ) {
      const toast = document.createElement("div");
      toast.className =
        "toast align-items-center text-bg-info border-0 show position-fixed top-0 start-50 translate-middle-x";
      toast.style.zIndex = "9999";
      toast.style.minWidth = "300px";
      toast.innerHTML = `
        <div class="d-flex">
          <div class="toast-body">
          <strong>Cuenta ya registrada</strong><br/>
          Esta orden de servicio ya tiene una cuenta asociada. No es posible crear una nueva cuenta para esta orden.
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
        `;
      document.body.appendChild(toast);

      const removeToast = () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      };
      setTimeout(removeToast, 6000);
      toast
        .querySelector(".btn-close")
        ?.addEventListener("click", removeToast);
    } else if (orden) {
      getItemsToOrderServiceAccount(orden).then(() => {
        setShowCreateAccount(true);
      });
    }
  };

  const headerButtonsToEdit = [
    {
      titulo: "Crear Cuenta",
      onClick: () => handleCreateAccountButton(editData),
      className: "btn btn-bg-light btn-active-color-info",
      icon: (editData?.estado?.nombre === "Archivado" ||
        editData?.estado?.iD_Estado === STATUS_TBL.ORDER_SERVICE.ARCHIVED) && (
        <span className="ms-2" style={{ cursor: "pointer", color: "#0d6efd" }}>
          <i className="bi bi-info-circle"></i>
        </span>
      ),
    },
    {
      titulo: "Eliminar",
      onClick: () => {
        handleDelete(editData!);
      },
      className: "btn btn-bg-light btn-active-color-danger",
    },
  ];

  // Botones para InfoModal usando rowTableSelected
  const headerButtonsToInfo = [
    {
      titulo: "Crear Cuenta",
      onClick: () => handleCreateAccountButton(rowTableSelected),
      className: "btn btn-bg-light btn-active-color-info",
      icon: (rowTableSelected?.estado?.nombre === "Archivado" ||
        rowTableSelected?.estado?.iD_Estado ===
          STATUS_TBL.ORDER_SERVICE.ARCHIVED) && (
        <span className="ms-2" style={{ cursor: "pointer", color: "#0d6efd" }}>
          <i className="bi bi-info-circle"></i>
        </span>
      ),
    },
    {
      titulo: "Eliminar",
      onClick: () => {
        handleDelete(rowTableSelected!);
      },
      className: "btn btn-bg-light btn-active-color-danger",
    },
  ];
  //#endregion

  // #region 🧩 Render
  return (
    <div className="row p-4 gx-0">
     
        <GenericDataTable<DTO_OrdenServicio & Record<string, string>>
          title="Órdenes de Servicio"
          columnKeys={columnKeysOrdenDeServicio}
          labelMap={labelMap}
          data={data}
          onAdd={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          disableButtonAdd={disableButtonAdd}
          includeEstadoColumn
          showItemsButton
          onOpenItemsModal={(rowData) => {
            setShowItemsOrdenFormModal(true);
            setDataToItemsOrder(rowData as DTO_OrdenServicio);
          }}
          onRowClick={(rowData) => {
            setRowTableSelected(rowData as DTO_OrdenServicio);
          }}
          customColumns={[referenciaJSONColumn]}
          customRenderers={customRenderers}
        />

      <InfoModal
        show={!!rowTableSelected}
        onHide={() => setRowTableSelected(undefined)}
        data={rowTableSelected!}
        fields={infoModalFields}
        headerButtons={headerButtonsToInfo}
      />

      {/* Modal Registrar */}
      <GenericFormModal<DTO_OrdenServicio>
        title="Registrar Orden"
        show={isFormOpen}
        onHide={handleCancelAdd}
        data={formData}
        setData={setFormData}
        onSubmit={handleSave}
        fields={newFormFields}
      />

      {/* Modal Editar */}
      <GenericFormModal<DTO_OrdenServicio>
        title="Editar Orden de Servicio"
        show={showEditForm}
        onHide={() => setShowEditForm(false)}
        data={editData}
        setData={setEditData}
        onSubmit={handleSaveEdit}
        fields={editFormFields}
        headerButtons={headerButtonsToEdit}
      />

      {/* Modal Crear Cuenta */}
      <GenericFormModal<DTO_Cuenta>
        title="Crear Cuenta"
        show={showCreateAccount}
        onHide={() => setShowCreateAccount(false)}
        data={account!}
        setData={(x) => setAccount(x as DTO_Cuenta)}
        onSubmit={() => {
          if (account) {
            handleCreateAccount(account);
          }
        }}
        fields={formCreateAccountFields}
      />

      <ItemsOrdenDeServicioModal
        open={showItemsOrdenFormModal}
        onHide={() => setShowItemsOrdenFormModal(false)}
        rowData={dataToItemsOrder || new DTO_OrdenServicio()}
      />

      {/* === Modal Genérico: Confirmación === */}
      <ConfirmModal
        show={isConfirmOpen}
        confirmMessage={confirmModalMessage}
        onAction={(action) => confirmModalAcion(action)}
      />
    </div>
  );
  // #endregion
};
// #endregion
