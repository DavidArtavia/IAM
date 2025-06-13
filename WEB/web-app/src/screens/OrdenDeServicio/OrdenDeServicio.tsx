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

/**
 * Genera una clave segura a partir de un nombre (para propiedades dinámicas).
 */
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
  // 1. Estados locales y hooks
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [ordenes, setOrdenes] = useState<DTO_OrdenServicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [disableButtonAdd, setDisableButtonAdd] = useState(true);
  const [selectedClientOption, setSelectedClientOption] =
    useState<ClientOption | null>(null);

  // 2. Estado para crear nueva orden
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_OrdenServicio>(
    new DTO_OrdenServicio()
  );

  // 3. Estado para editar orden existente
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<DTO_OrdenServicio>(
    new DTO_OrdenServicio()
  );

  // 4. Cargar órdenes al seleccionar un negocio
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

  // Maneja la selección de un negocio
  const handleSelectBusiness = (neg: DTO_Negocio) => {
    setSelectedBusiness(neg);
    setDisableButtonAdd(false);
  };

  // 5. Abrir formulario de nueva orden e inicializar referenciaJSON
  const handleAddNew = () => {
    if (!selectedBusiness) return;
    const initial = new DTO_OrdenServicio();
    initial.referenciaJSON =
      selectedBusiness.referenciaJSON?.map((r) => ({
        nombre: r.nombre,
        valor: "",
      })) || [];
    setFormData(initial);
    setSelectedClientOption(null);
    setIsFormOpen(true);
  };

  // 7. Guardar nueva orden
  const handleSave = () => {
    if (!selectedBusiness) return;
    formData.iD_Negocio = selectedBusiness.iD_Negocio;
    // formData.fechaOrdenServicio = new Date();
    // const sanitized = { ...formData } as any;
    // const todayIso = new Date().toISOString().slice(0, 10);
    // [
    //   "fechaInicio",
    //   "fechaFinal",
    //   "fechaEntrega",
    //   "fechaEstimadaEntrega",
    // ].forEach((key) => {
    //   const raw = sanitized[key] as string | undefined;
    //   const d = raw ? new Date(raw) : null;
    //   if (!d || isNaN(d.getTime()) || d.getFullYear() < 1753) {
    //     sanitized[key] = todayIso;
    //   }
    // });

    ordenesService.registrarOrdensDeServicio(formData).subscribe({
      next: (res) => {
        notificationHelpers.successAlert((res as DTO_Respuesta).mensaje);
        setIsFormOpen(false);
        // Recargar lista
        setOrdenes((prev) => [
          ...((res as DTO_Respuesta).resultado as DTO_OrdenServicio[]),
          ...prev,
        ]);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  // 8.  Menejo y edición de orden
  const handleEdit = (row: DTO_OrdenServicio) => {
    if (!selectedBusiness) return;
    console.log("Editando orden:", row);

    // 0) Limpiar la nota dejando solo lo que hay después de la última '|'
    const rawNote = row.notaOrdenServicio || "";
    const cleanedNote = rawNote.includes("|")
      ? rawNote.substring(rawNote.lastIndexOf("|") + 1).trim()
      : rawNote.trim();
    // Prepara objeto de ediciónpas lo editado a referenciaJSON
    const copy = { ...row, notaOrdenServicio: cleanedNote } as DTO_OrdenServicio;
    copy.referenciaJSON =
      row.referenciaJSON?.map((r) => ({ nombre: r.nombre, valor: r.valor })) ||
      [];
    setEditData(copy);
    // Opcional: precargar cliente
    // Extraer el nombre del cliente desde la nota, por ejemplo: "Cliente: nombre | ..."
    const clienteMatch = row.notaOrdenServicio.match(/Cliente:\s*([^|]+)/);
    const clienteNombre = clienteMatch ? clienteMatch[1].trim() : "";
    setSelectedClientOption({
      value: row.iD_Cliente || 0,
      label: clienteNombre,
    });
    setShowEditForm(true);
  };
 

  const handleSaveEdit = () => {
    if (!selectedBusiness) return;


    // 1) Preparamos un objeto completamente nuevo, sin mutar editData
    const sanitized: DTO_OrdenServicio = {
      ...editData,
      iD_Negocio: selectedBusiness.iD_Negocio,
      fechaOrdenServicio: new Date(), // marca el momento de la edición

      // parseamos cada campo de fecha a Date local a medianoche:
      fechaInicio: dateHelpers.parseDateInput(editData.fechaInicio as any),
      fechaFinal: dateHelpers.parseDateInput(editData.fechaFinal as any),
      fechaEntrega: dateHelpers.parseDateInput(editData.fechaEntrega as any),
      fechaEstimadaEntrega: dateHelpers.parseDateInput(
        editData.fechaEstimadaEntrega as any
      ),
    };

    // 2) Reflejamos ya en el modal
    setEditData(sanitized);

    // 3) Refrescamos la tabla al instante
    setOrdenes((prev) =>
      prev.map((o) =>
        o.iD_OrdenServicio === sanitized.iD_OrdenServicio ? sanitized : o
      )
    );

    // 4) Llamamos al servicio con los datos saneados
    ordenesService.actualizarOrdensDeServicio(sanitized).subscribe({
      next: (res: DTO_Respuesta) => {
        notificationHelpers.successAlert(res.mensaje);
        setShowEditForm(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  // 9. Preparar datos para DataTable y modal de info
  const tableConfig = useMemo(() => {
    const referenceMap = new Map<string, string>();
    ordenes.forEach((o) =>
      o.referenciaJSON?.forEach((r) => {
        const key = generateSafeKey(r.nombre);
        if (!referenceMap.has(r.nombre)) referenceMap.set(r.nombre, key);
      })
    );

    const prepared = ordenes.map((o) => {
      const copy: any = { ...o };
      o.referenciaJSON?.forEach((r) => {
        const key = referenceMap.get(r.nombre);
        if (key) copy[key] = r.valor;
      });
      return copy;
    });

    const refCols = Array.from(referenceMap.values());
    const extLabelMap = { ...labelMapOrdenDeServicio } as Record<
      string,
      string
    >;
    referenceMap.forEach((safe, raw) => {
      extLabelMap[safe] = raw;
    });

    const finalKeys = [...columnKeysOrdenDeServicio.map(String), ...refCols];
    const staticKeys = columnKeysInfoModalOrdenDeServicio as string[];
    const dynKeys = finalKeys.filter((k) => !staticKeys.includes(k));
    const modalFields = [
      ...staticKeys,
      ...dynKeys,
    ] as (keyof DTO_OrdenServicio)[];

    return {
      data: prepared,
      columnKeys: finalKeys,
      labelMap: extLabelMap,
      modalFields,
    };
  }, [ordenes]);

  const { data, columnKeys, labelMap, modalFields } = tableConfig;

  // 10. Campos dinámicos de referenciaJSON para formularios
  const buildRefFields = (item: DTO_OrdenServicio) =>
    item.referenciaJSON?.map((r, idx) => ({
      key: generateSafeKey(r.nombre) as keyof DTO_OrdenServicio,
      label: r.nombre,
      type: "custom" as FieldConfig<DTO_OrdenServicio>["type"],
      renderer: () => (
        <input
          className="form-control"
          value={item.referenciaJSON?.[idx].valor || ""}
          onChange={(e) => {
            const arr = [...(item.referenciaJSON || [])];
            arr[idx] = { nombre: r.nombre, valor: e.target.value };
            if (item === formData)
              setFormData({
                ...item,
                referenciaJSON: arr,
              } as DTO_OrdenServicio);
            else
              setEditData({
                ...item,
                referenciaJSON: arr,
              } as DTO_OrdenServicio);
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
    // Campos dinámicos de referenciaJSON
    ...buildRefFields(editData),
  ];

  // 11. Renderizado
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
            Seleccione un negocio para ver las ordenes
          </p>
        </div>
      )}

      {/* // 12. Modales para formularios */}
      {/* // Modal Genérico: Registrar Orden de Servicio */}
      <GenericFormModal<DTO_OrdenServicio>
        title="Registrar Orden"
        show={isFormOpen}
        onHide={() => setIsFormOpen(false)}
        data={formData}
        setData={setFormData}
        onSubmit={handleSave}
        fields={newFormFields}
      />
      {/* // Modal Genérico: Editar Orden de Servicio */}
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
