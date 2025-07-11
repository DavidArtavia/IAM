import {
  AsyncClientSelect,
  ClientOption,
  ConfirmModal,
  FieldConfig,
  GenericDataTable,
  GenericFormModal,
  InfoPanel,
  ItemsOrdenDeServicioModal,
  LoadingPanel,
  ReferenciaCards,
} from "@/components";
import ReactDOM from "react-dom/client";
import {
  RESTRICCIONES,
  STATUS_ORDEN_SERVICIO_OPTIONS,
  STATUS_TBL,
} from "@/constants";
import { DTO_Negocio, DTO_OrdenServicio, DTO_Respuesta } from "@/models";
import { ordenesService } from "@/services";
import {
  keysInfoModalOrdenDeServicio,
  columnKeysOrdenDeServicio,
  dateHelpers,
  errorHelpers,
  labelMapOrdenDeServicio,
  notificationHelpers,
  ordenServicioFormEditFields,
  parametrosAString,
} from "@/utils";
import { useApp } from "@/hooks/useApp";

import { useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";

const generateSafeKey = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");

export const OrdenDeServicio = () => {
  //🔄 Estado general
  const { state } = useApp();

  useEffect(() => {
    if (state.negocio) {
      setSelectedBusiness(state.negocio);
      handleSelectBusiness(state.negocio);
    }
  }, [state]);

  //#endregion

  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [ordenes, setOrdenes] = useState<DTO_OrdenServicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [disableButtonAdd, setDisableButtonAdd] = useState(true);
  const [selectedClientOption, setSelectedClientOption] =
    useState<ClientOption | null>(null);
  //#endregion

  //#region ➕ Registro
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_OrdenServicio>(() => {
    const dto = new DTO_OrdenServicio();
    dto.fechaInicio = null;
    dto.fechaFinal = null;
    dto.fechaEntrega = null;
    dto.fechaEstimadaEntrega = null;
    return dto;
  });
  //#endregion

  //#region ✏️ Edición
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<DTO_OrdenServicio>(() => {
    const dto = new DTO_OrdenServicio();
    dto.fechaInicio = null;
    dto.fechaFinal = null;
    dto.fechaEntrega = null;
    dto.fechaEstimadaEntrega = null;
    return dto;
  });
  //#endregion

  //#region 🧩 Ítems
  const [showItemsOrdenFormModal, setShowItemsOrdenFormModal] = useState(false);
  const [dataToItemsOrder, setDataToItemsOrder] =
    useState<DTO_OrdenServicio | null>(null);
  //#endregion

  //#region 🗑 Confirmación
  const [orderToDelete, setOrderToDelete] =
    useState<DTO_OrdenServicio | null>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  //#endregion

  //#region 🚀 Obtener órdenes
  useEffect(() => {
    if (!selectedBusiness) return;
    setLoading(true);
    const sub = ordenesService
      .obtenerOrdensDeServicio(selectedBusiness)
      .subscribe({
        next: (res) =>
          setOrdenes(
            ((res as DTO_Respuesta).resultado as DTO_OrdenServicio[]) || []
          ),
        error: errorHelpers.serverError,
        complete: () => setLoading(false),
      });
    return () => sub.unsubscribe();
  }, [selectedBusiness]);
  //#endregion

  //#region 🧩 Negocio seleccionado
  const handleSelectBusiness = (neg: DTO_Negocio) => {
    setSelectedBusiness(neg);
    setDisableButtonAdd(false);
  };
  //#endregion

  //#region ➕ Registrar
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
  //#endregion

  //#region 🛠️ Editar
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
    if (!selectedBusiness) return;
    const cleanedNote = row.notaOrdenServicio?.split("|").pop()?.trim() || "";
    const copy: any = {
      ...row,
      notaOrdenServicio: cleanedNote,
      iD_Negocio: selectedBusiness.iD_Negocio,
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
  //#endregion

  //#region 🗑 Eliminar
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

  //#region ✅ Guardar edición
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

  //#region 🧱 Campos personalizados y referencias dinámicas
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

  const editFormFields: FieldConfig<DTO_OrdenServicio>[] = [
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
          />
        );
      },
    },
    ...buildRefFields(editData),
  ];
  //#endregion

  //#region ⚡ Confirm Modal y Custom Renderers
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

  const customRenderers = {
    fechaOrdenServicio: (val: unknown) =>
      val ? new Date(String(val)).toLocaleDateString() : "",
    fechaEstimadaEntrega: (val: unknown) =>
      val ? new Date(String(val)).toLocaleDateString() : "",
  };
  //#endregion

  //#region 🧠 Memo tabla
  const { data, labelMap, modalFields } = useMemo(() => {
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

    const refCols = Array.from(referenceMap.values());
    const staticKeys = keysInfoModalOrdenDeServicio as string[];
    const dynKeys = refCols.filter((k) => !staticKeys.includes(k));

    return {
      data: prepared,
      labelMap: extLabelMap,
      modalFields: [...staticKeys, ...dynKeys],
    };
  }, [ordenes]);
  //#endregion

  //#region 🏷️ Columna Referencias para DataTable
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
        // Type assertion to HTMLElement for DOM manipulation
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

  // #region 🧩 Render
  return (
    <div className="row p-4 gx-0">
      {state.negocio == null}
      {loading ? (
        <LoadingPanel msj="Cargando órdenes de servicio, por favor espere..." />
      ) : selectedBusiness ? (
        <GenericDataTable<DTO_OrdenServicio & Record<string, string>>
          title="Órdenes de Servicio"
          columnKeys={columnKeysOrdenDeServicio} // columnKeys incopora las referenciasJson dinámicas -> cambiar por columnKeysOrdenDeServicio si se quiere no mostrar la referencias en la tabla
          labelMap={labelMap}
          data={data}
          onAdd={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          disableButtonAdd={disableButtonAdd}
          includeEstadoColumn
          modalInfoFields={modalFields}
          showItemsButton
          datekeys={[
            // fechas que se muestran como 	24/6/2025 y si es 1/1/1
            //-> se muestra No se ha definido aún en el modal de info
            "fechaOrdenServicio",
            "fechaEstimadaEntrega",
            "fechaInicio",
            "fechaFinal",
            "fechaEntrega",
          ]}
          onOpenItemsModal={(rowData) => {
            setShowItemsOrdenFormModal(true);
            setDataToItemsOrder(rowData as DTO_OrdenServicio);
          }}
          customColumns={[referenciaJSONColumn]} // Añadimos la columna personalizada
          customRenderers={customRenderers}
        />
      ) : (
        <InfoPanel msj="Seleccione un negocio para ver las órdenes de servicio" />
      )}

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
};
// #endregion
