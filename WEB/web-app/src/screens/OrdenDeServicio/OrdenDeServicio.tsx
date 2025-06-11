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

export const OrdenDeServicio = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [ordenes, setOrdenes] = useState<DTO_OrdenServicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [disableButtonAdd, setDisableButtonAdd] = useState(true);
  const [selectedClientOption, setSelectedClientOption] =
    useState<ClientOption | null>(null);

  // 1) Fetch once per business selection
  useEffect(() => {
    if (!selectedBusiness) return;
    setLoading(true);
    const sub = ordenesService
      .obtenerOrdensDeServicio(selectedBusiness)
      .subscribe({
        next: (res) =>
          setOrdenes(((res as any).resultado || []) as DTO_OrdenServicio[]),
        error: (err) => errorHelpers.serverError(err),
        complete: () => setLoading(false),
      });
    return () => sub.unsubscribe();
  }, [selectedBusiness]);

  const handleSelectBusiness = (neg: DTO_Negocio) => {
    setSelectedBusiness(neg);
    setDisableButtonAdd(false);
  };

  // 2) Prepare todo junto - datos y configuración de columnas en un solo useMemo
  const tableConfig = useMemo(() => {
    // Construir el mapa de referencias
    const referenceMap = new Map<string, string>();
    ordenes.forEach((o) => {
      o.referenciaJSON?.forEach((r) => {
        const safe = r.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^\w_]/g, "");
        if (!referenceMap.has(r.nombre)) {
          referenceMap.set(r.nombre, safe);
        }
      });
    });

    // Preparar los datos con las propiedades dinámicas
    const preparedOrders = ordenes.map((o) => {
      const copy: any = { ...o };
      o.referenciaJSON?.forEach((r) => {
        const safeKey = referenceMap.get(r.nombre);
        if (safeKey) {
          copy[safeKey] = r.valor ?? "";
        }
      });
      return copy;
    });

    // Construir las columnas dinámicas
    const referenceCols = Array.from(referenceMap.values());

    // Construir el labelMap extendido
    const extendedLabelMap = { ...labelMapOrdenDeServicio } as Record<
      string,
      string
    >;
    referenceMap.forEach((safe, raw) => {
      extendedLabelMap[safe] = raw;
    });

    // Construir las keys finales
    const finalKeys = [
      ...columnKeysOrdenDeServicio.map(String),
      ...referenceCols,
    ];

    return {
      data: preparedOrders,
      columnKeys: finalKeys,
      labelMap: extendedLabelMap,
      hasReferences: referenceMap.size > 0,
    };
  }, [ordenes]);

  // 3) Form fields
  const formFields: FieldConfig<DTO_OrdenServicio>[] = [
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
            onChange(opt ? opt.value : 0);
          }}
        />
      ),
    },
  ];

  // 4) Add / Save handlers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(new DTO_OrdenServicio());

  const handleAddNew = () => setIsFormOpen(true);
  const handleSave = () => {
    formData.iD_Negocio = selectedBusiness!.iD_Negocio;
    ordenesService.registrarOrdensDeServicio(formData).subscribe({
      next: (res: unknown) => {
        notificationHelpers.successAlert((res as DTO_Respuesta).mensaje);
        setIsFormOpen(false);
      },
      error: (e) => errorHelpers.serverError(e),
    });
  };

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
          columnKeys={tableConfig.columnKeys}
          labelMap={tableConfig.labelMap}
          data={tableConfig.data}
          onAdd={handleAddNew}
          onEdit={() => {}}
          onDelete={() => {}}
          disableButtonAdd={disableButtonAdd}
          includeEstadoColumn
          customRenderers={{
            fechaOrdenServicio: (v) => new Date(String(v)).toLocaleDateString(),
            fechaEstimadaEntrega: (v) =>
              new Date(String(v)).toLocaleDateString(),
          }}
          modalInfoFields={columnKeysInfoModalOrdenDeServicio.map(String)}
        />
      ) : (
        <div className="d-flex justify-content-center my-5">
          <p className="text-muted">
            Seleccione un negocio para ver las órdenes de servicio
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
        fields={formFields}
      />

      <ConfirmModal show={false} confirmMessage="" onAction={() => {}} />
    </div>
  );
};
