import {
  AsyncClientSelect,
  BusinessButtons,
  ClientOption,
  ConfirmModal,
  FieldConfig,
  GenericDataTable,
  GenericFormModal,
} from "@/components";
import { DTO_Negocio, DTO_OrdenServicio, DTO_Respuesta } from "@/models";
import { ordenesService } from "@/services";
import {
  columnKeysInfoModalOrdenDeServicio,
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

  const handleAddNew = () => {
    if (!selectedBusiness) return;
    const initial = new DTO_OrdenServicio();
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

  // --------------------------------------------------
  // 4. GUARDAR NUEVA ORDEN
  // --------------------------------------------------
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
        sanitized[key] = d && d.getFullYear() >= 1753 ? d : null;
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
  const { data, columnKeys, labelMap, modalFields } = useMemo(() => {
    const referenceMap = new Map<string, string>();

    ordenes.forEach((o) =>
      o.referenciaJSON?.forEach((r) => {
        const key = generateSafeKey(r.nombre);
        if (!referenceMap.has(r.nombre)) {
          referenceMap.set(r.nombre, key);
        }
      })
    );

    const prepared = ordenes.map((o) => {
      const copy: any = { ...o };
      o.referenciaJSON?.forEach((r) => {
        const key = referenceMap.get(r.nombre)!;
        copy[key] = r.valor;
      });
      return copy;
    });

    const extLabelMap = { ...labelMapOrdenDeServicio } as Record<
      string,
      string
    >;
    referenceMap.forEach((safe, raw) => {
      extLabelMap[safe] = raw;
    });

    const refCols = Array.from(referenceMap.values());
    const finalKeys = [...columnKeysOrdenDeServicio.map(String), ...refCols];
    const staticKeys = columnKeysInfoModalOrdenDeServicio as string[];
    const dynKeys = finalKeys.filter((k) => !staticKeys.includes(k));
    const modalFields = [...staticKeys, ...dynKeys];

    return {
      data: prepared,
      columnKeys: finalKeys,
      labelMap: extLabelMap,
      modalFields,
    };
  }, [ordenes]);

  // --------------------------------------------------
  // 8. BUILDER PARA CAMPOS DINÁMICOS referenceJSON
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
        <div className="d-flex justify-content-center my-5">
          <span className="spinner-border" /> Cargando…
        </div>
      ) : selectedBusiness ? (
        <GenericDataTable<DTO_OrdenServicio & Record<string, string>>
          title="Órdenes de Servicio"
          columnKeys={columnKeys}
          labelMap={labelMap}
          data={data}
          onAdd={handleAddNew}
          onEdit={handleEdit}
          onDelete={() => {}}
          disableButtonAdd={disableButtonAdd}
          includeEstadoColumn
          customRenderers={{
            fechaOrdenServicio: (v) => new Date(String(v)).toLocaleDateString(),
            fechaEstimadaEntrega: (v) =>
              new Date(String(v)).toLocaleDateString(),
          }}
          modalInfoFields={modalFields}
        />
      ) : (
        <div className="d-flex justify-content-center my-5">
          <p className="text-muted">
            Seleccione un negocio para ver las órdenes
          </p>
        </div>
      )}

      {/* Modal Registrar */}
      <GenericFormModal<DTO_OrdenServicio>
        title="Registrar Orden"
        show={isFormOpen}
        onHide={() => setIsFormOpen(false)}
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

      <ConfirmModal show={false} confirmMessage="" onAction={() => {}} />
    </div>
  );
};
