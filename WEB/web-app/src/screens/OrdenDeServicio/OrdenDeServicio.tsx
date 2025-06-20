import {
  AsyncClientSelect,
  BusinessButtons,
  ClientOption,
  ConfirmModal,
  FieldConfig,
  GenericDataTable,
  GenericFormModal,
  InfoPanel,
  ItemsOrdenDeServicioModal,
  LoadingPanel,
} from "@/components";
import { RESTRICCIONES, STATUS_TBL } from "@/constants";
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
} from "@/utils";
import { useEffect, useMemo, useState } from "react";

/** Genera una clave segura a partir de un nombre (para campos dinámicos) */
const generateSafeKey = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");

/**
 * Componente principal para gestionar la pantalla de Órdenes de Servicio.
 */
export const OrdenDeServicio = () => {
  // --------------------------------------------------
  // 1. HOOKS Y ESTADOS
  // --------------------------------------------------
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [ordenes, setOrdenes] = useState<DTO_OrdenServicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [disableButtonAdd, setDisableButtonAdd] = useState(true);
  const [selectedClientOption, setSelectedClientOption] =
    useState<ClientOption | null>(null);

  // Formulario “Registrar Orden” (fechas inician en null)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_OrdenServicio>(() => {
    const dto = new DTO_OrdenServicio();
    dto.fechaInicio = null;
    dto.fechaFinal = null;
    dto.fechaEntrega = null;
    dto.fechaEstimadaEntrega = null;
    return dto;
  });

  // Formulario “Editar Orden” (fechas inician en null)
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<DTO_OrdenServicio>(() => {
    const dto = new DTO_OrdenServicio();
    dto.fechaInicio = null;
    dto.fechaFinal = null;
    dto.fechaEntrega = null;
    dto.fechaEstimadaEntrega = null;
    return dto;
  });
  
  // Modal de Ítems de Orden de Servicio
  const [showItemsOrdenFormModal, setShowItemsOrdenFormModal] = useState(false);
  const [dataToItemsOrder, setDataToItemsOrder] =
    useState<DTO_OrdenServicio | null>(null);

  // --------- Modal de Confirmación de Borrar / Cancelar -----------
  const [orderToDelete, setOrderToDelete] =
    useState<DTO_OrdenServicio | null>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);

  // --------------------------------------------------
  // 2. EFECTO: CARGAR ÓRDENES CUANDO CAMBIA selectedBusiness
  // --------------------------------------------------
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
        error: (err) => errorHelpers.serverError(err),
        complete: () => setLoading(false),
      });
    return () => sub.unsubscribe();
  }, [selectedBusiness]);

  // --------------------------------------------------
  // 3. HANDLERS BÁSICOS
  // --------------------------------------------------
  const handleSelectBusiness = (neg: DTO_Negocio) => {
    setSelectedBusiness(neg);
    setDisableButtonAdd(false);
  };

  // --------------------------------------------------
  // 4. GUARDAR NUEVA ORDEN
  // --------------------------------------------------
  const handleAddNew = () => {
    if (!selectedBusiness) return;
    const initial = new DTO_OrdenServicio();
    //
    initial.referenciaJSON =
      selectedBusiness.referenciaJSON?.map((r) => ({
        nombre: r.nombre,
        valor: "",
      })) || [];
    // Fechas opcionales arrancan en null (input date vacío)
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

    // Solo convertir a Date si el usuario tipeó algo, sino null
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
      error: (err) => errorHelpers.serverError(err),
    });
  };

  const handleCancelAdd = () => {
    setConfirmModalMessage(
      "¿Estás seguro de que deseas cancelar la nueva orden?"
    );
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };

  // --------------------------------------------------
  // 5. EDITAR ORDEN: preparar datos
  // --------------------------------------------------
  const normalizeIncomingDate = (raw?: string | Date | null): string | null => {
    if (!raw) return null;
    const date = typeof raw === "string" ? new Date(raw) : raw;
    if (
      !(date instanceof Date) ||
      isNaN(date.getTime()) ||
      date.getFullYear() < 1753
    ) {
      return null;
    }
    // Mantenemos el string original para que el <input type="date"> lo parsee bien
    return typeof raw === "string" ? raw : date.toISOString();
  };
  const handleEdit = (row: DTO_OrdenServicio) => {
    if (!selectedBusiness) return;

    // Quitar todo antes de la última '|'
    const rawNote = row.notaOrdenServicio || "";
    const cleanedNote = rawNote.includes("|")
      ? rawNote.substring(rawNote.lastIndexOf("|") + 1).trim()
      : rawNote.trim();

    const copy: any = {
      ...row,
      notaOrdenServicio: cleanedNote,
      iD_Negocio: selectedBusiness.iD_Negocio,
      fechaInicio: normalizeIncomingDate(row.fechaInicio),
      fechaFinal: normalizeIncomingDate(row.fechaFinal),
      fechaEntrega: normalizeIncomingDate(row.fechaEntrega),
      fechaEstimadaEntrega: normalizeIncomingDate(row.fechaEstimadaEntrega),
    };

    // Pre-cargar cliente si aparece en la nota
    const clienteMatch = row.notaOrdenServicio.match(/Cliente:\s*([^|]+)/);
    const clienteNombre = clienteMatch ? clienteMatch[1].trim() : "";
    setSelectedClientOption({
      value: row.iD_Cliente || 0,
      label: clienteNombre,
    });

    setEditData(copy);
    setShowEditForm(true);
  };
  // --------------------------------------------------
  // 5.1 EDITAR ESTADO A ELIMINADO: preparar datos
  // --------------------------------------------------

  const handleDelete = (rowData: DTO_OrdenServicio) => {
    setConfirmModalMessage(
      `¿Estás seguro de que deseas eliminar la orden ${rowData.notaOrdenServicio} ?`
    );
    setOrderToDelete(rowData);
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = (action: boolean | null) => {
    if (action && orderToDelete) {
      // 1) Clonamos la orden original y cambiamos solo el estado:
      const updated: DTO_OrdenServicio = {
        ...orderToDelete,
        estado: {
          ...orderToDelete.estado!,
          iD_Estado: STATUS_TBL.ORDER_SERVICE.DELETED,
        },
      };

      // 2) Normalizamos fechas inválidas (<1753 o 0001-01-01) a null,
      //    pero mantenemos las fechas válidas sin tocarlas.
      const sanitized: any = { ...updated };
      const dateKeys = [
        "fechaInicio",
        "fechaFinal",
        "fechaEntrega",
        "fechaEstimadaEntrega",
      ] as const;

      dateKeys.forEach((key) => {
        const raw = (sanitized[key] as string | Date | null) ?? null;
        const date = raw ? new Date(raw) : null;
        // Si la fecha es inválida o anterior a 1753, la dejamos como null
        if (!date || isNaN(date.getTime()) || date.getFullYear() < 1753) {
          sanitized[key] = null;
        } else {
          // Si viniera como string, conviértelo a Date para ser consistente
          sanitized[key] = date;
        }
      });

      // 3) Refrescar tabla local con las fechas saneadas únicamente cuando hacían falta
      setOrdenes((prev) =>
        prev.map((o) =>
          o.iD_OrdenServicio === sanitized.iD_OrdenServicio ? sanitized : o
        )
      );

      // 4) Llamar al servicio con el objeto limpio
      ordenesService.actualizarOrdensDeServicio(sanitized).subscribe({
        next: (result) => {
          notificationHelpers.infoAlert(result?.mensaje);
        },
        error: (err) => errorHelpers.serverError(err),
      });

      setOrderToDelete(null);
    }

    setIsConfirmOpen(false);
  };

  // --------------------------------------------------
  // 6. GUARDAR EDICIÓN
  // --------------------------------------------------
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
      const raw = (sanitized[key] as string | null) ?? null;
      if (raw) {
        const d = dateHelpers.parseDateInput(raw as any);
        sanitized[key] = d && d.getFullYear() >= RESTRICCIONES.MIN_ANNO_PERMITIDO ? d : null;
      } else {
        sanitized[key] = null;
      }
    });
    // Refrescar tabla local
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
      error: (err) => errorHelpers.serverError(err),
    });
  };

  // --------------------------------------------------
  // 7. CONFIGURACIÓN DE TABLA Y MODAL DE INFO
  // --------------------------------------------------
  // ✅ Memoriza el resultado para evitar recalcular en cada render si no cambian las órdenes
  const { data, /* columnKeys, */ labelMap, modalFields } = useMemo(() => {
    // 🧠 Mapa para asociar cada nombre de referencia con una clave segura
    const referenceMap = new Map<string, string>();

    // 🔄 Paso 1: construir el referenceMap dinámicamente a partir de los nombres únicos
    ordenes.forEach((o) =>
      o.referenciaJSON?.forEach((r) => {
        const key = generateSafeKey(r.nombre); // p. ej. "Placa" → "placa"
        if (!referenceMap.has(r.nombre)) {
          referenceMap.set(r.nombre, key); // Evita duplicados
        }
      })
    );

    // 🔄 Paso 2: aplanar las referencias dentro del objeto de orden
    const prepared = ordenes.map((o) => {
      const copy: any = { ...o }; // Copia de la orden original
      o.referenciaJSON?.forEach((r) => {
        const key = referenceMap.get(r.nombre)!; // Obtiene clave segura
        copy[key] = r.valor; // Asigna como propiedad normal
      });
      return copy; // Devuelve la orden modificada
    });

    // 🏷️ Paso 3: extender el labelMap con nombres dinámicos amigables
    const extLabelMap = { ...labelMapOrdenDeServicio } as Record<
      string,
      string
    >;
    referenceMap.forEach((safe, raw) => {
      extLabelMap[safe] = raw; // ej. extLabelMap["placa"] = "Placa"
    });

    // 🧩 Paso 4: preparar claves finales para columnas y modal
    const refCols = Array.from(referenceMap.values()); // columnas extra dinámicas
    const finalKeys = [...columnKeysOrdenDeServicio.map(String), ...refCols]; // claves para tabla
    const staticKeys = keysInfoModalOrdenDeServicio as string[]; // campos del modal fijos
    const dynKeys = finalKeys.filter((k) => !staticKeys.includes(k)); // solo dinámicos
    const modalFields = [...staticKeys, ...dynKeys]; // orden final en modal

    // 🧾 Resultado final del useMemo
    return {
      data: prepared, // datos transformados
      columnKeys: finalKeys, // claves para tabla
      labelMap: extLabelMap, // etiquetas extendidas
      modalFields, // campos ordenados para modal
    };
  }, [ordenes]);

  // --------------------------------------------------
  // 8. BUILDER PARA CAMPOS DINÁMICOS referenceJSON
  //Su propósito es generar una lista de campos de formulario
  //-dinámicos basados en la propiedad referenciaJSON de ese objeto.
  // --------------------------------------------------
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
              setFormData({
                ...item,
                referenciaJSON: arr,
              } as DTO_OrdenServicio);
            } else {
              setEditData({
                ...item,
                referenciaJSON: arr,
              } as DTO_OrdenServicio);
            }
          }}
        />
      ),
    })) || [];

  // --------------------------------------------------
  // 9. CAMPOS PARA LOS FORMULARIOS (Registrar y Editar)
  // --------------------------------------------------
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
    ...buildRefFields(editData),
  ];
  // ======== Manejo de confirmación de “Cancelar registro” o “Eliminar”  ========

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

    //este renderizador personalizado formatea los valores de las columnas
    const customRenderers: {
      [K in keyof DTO_OrdenServicio]?: (
        value: unknown,
        rowData: DTO_OrdenServicio
      ) => string | number | React.ReactNode;
    } = {
      fechaOrdenServicio: (val: unknown) => {
        if (!val) return "";
        return new Date(String(val)).toLocaleDateString();
      },
      fechaEstimadaEntrega: (val: unknown) => {
        if (!val) return "";
        return new Date(String(val)).toLocaleDateString();
      },
    };

  // --------------------------------------------------
  // 10. RENDERIZADO
  // --------------------------------------------------
  return (
    <div className="row p-4 gx-0">
      <BusinessButtons
        title="Seleccione un negocio"
        selectedBusiness={selectedBusiness}
        handleSelectBusiness={handleSelectBusiness}
      />
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
          includeReferenceColumn // Si se quiere mostrar la columna de referenciasJson
          modalInfoFields={modalFields}
          showItemsButton
          datekeys={["fechaOrdenServicio", "fechaEstimadaEntrega", "fechaInicio", "fechaFinal", "fechaEntrega"]}
          onOpenItemsModal={(rowData) => {
            setShowItemsOrdenFormModal(true);
            setDataToItemsOrder(rowData as DTO_OrdenServicio);
          }}
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
