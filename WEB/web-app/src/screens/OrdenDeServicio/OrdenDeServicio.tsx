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

  // 6. Abrir formulario de edición y precargar datos
  const handleEdit = (row: DTO_OrdenServicio) => {
    if (!selectedBusiness) return;
    // Prepara objeto de edición copiando referenciaJSON
    const copy = { ...row };
    copy.referenciaJSON =
      row.referenciaJSON?.map((r) => ({ nombre: r.nombre, valor: r.valor })) ||
      [];
    setEditData(copy);
    // Opcional: precargar cliente
    setSelectedClientOption(
      row.iD_Cliente ? ({ label: "", value: row.iD_Cliente } as any) : null
    );
    setShowEditForm(true);
  };

  // 7. Guardar nueva orden
  const handleSave = () => {
    if (!selectedBusiness) return;
    formData.iD_Negocio = selectedBusiness.iD_Negocio;
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

  // 8. Guardar edición de orden
  const handleSaveEdit = () => {
    if (!selectedBusiness) return;
    editData.iD_Negocio = selectedBusiness.iD_Negocio;
    ordenesService.actualizarOrdensDeServicio(editData).subscribe({
      next: (res) => {
        notificationHelpers.successAlert((res as DTO_Respuesta).mensaje);
        setShowEditForm(false);
        // Actualizar lista localmente
        setOrdenes((prev) =>
          prev.map((o) =>
            o.iD_OrdenServicio === editData.iD_OrdenServicio ? editData : o
          )
        );
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

      <GenericFormModal<DTO_OrdenServicio>
        title="Registrar Orden"
        show={isFormOpen}
        onHide={() => setIsFormOpen(false)}
        data={formData}
        setData={setFormData}
        onSubmit={handleSave}
        fields={newFormFields}
      />

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
