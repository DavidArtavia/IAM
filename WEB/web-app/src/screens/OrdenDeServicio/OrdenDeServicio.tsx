// src/pages/OrdenDeServicio.tsx
import React, { useState, useMemo } from "react";
import {
  AsyncClientSelect,
  BusinessButtons,
  GenericDataTable,
  GenericFormModal,
  ConfirmModal,
  ClientOption,
} from "@/components";
import { DTO_Negocio, DTO_OrdenServicio } from "@/models";
import { ordenesService } from "@/services";
import {
  columnKeysOrdenDeServicio,
  labelMapOrdenDeServicio,
  ordenServicioFormEditFields,
  notificationHelpers,
  errorHelpers,
} from "@/utils";
import { useBusinessData } from "@/hooks";

export const OrdenDeServicio = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [clientOption, setClientOption] = useState<ClientOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(new DTO_OrdenServicio());
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 1️⃣ Carga órdenes con nuestro hook
  const {
    data: ordenes,
    loading,
    error,
    reload,
  } = useBusinessData(
    ordenesService.obtenerOrdensDeServicio,
    selectedBusiness?.iD_Negocio ?? null
  );

  // 2️⃣ Campos de formulario memoizados

  const formFields = useMemo(
    () => [
      ...ordenServicioFormEditFields,
      {
        key: "iD_Cliente",
        label: "Cliente",
        type: "custom" as const,
        renderer: ({ onChange }: { onChange: (value: number) => void }) => (
          <AsyncClientSelect
            value={clientOption}
            onChange={(opt: ClientOption | null) => {
              setClientOption(opt);
              onChange(opt?.value ?? 0);
            }}
          />
        ),
      },
    ],
    [clientOption]
  );

  // 3️⃣ Handlers
  const handleSelectBusiness = (b: DTO_Negocio) => setSelectedBusiness(b);
  const openNewModal = () => {
    setFormData(new DTO_OrdenServicio());
    setIsModalOpen(true);
  };
  const saveNewOrder = () => {
    formData.iD_Negocio = selectedBusiness!.iD_Negocio;
    formData.referenciaJSON = selectedBusiness!.referenciaJSON;
    ordenesService
      .registrarOrdensDeServicio(formData)
      .then((r) => {
        notificationHelpers.successAlert(r.mensaje);
        setIsModalOpen(false);
        reload();
      })
      .catch(errorHelpers.serverError);
  };

  // 4️⃣ Renderizado condicional
  if (!selectedBusiness) {
    return (
      <BusinessButtons
        title="Seleccione un negocio para gestionar órdenes de servicio"
        handleSelectBusiness={handleSelectBusiness}
        selectedBusiness={null}
      />
    );
  }
  if (loading) return <div className="spinner-border" />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="p-4">
      <BusinessButtons
        title="Negocio seleccionado:"
        handleSelectBusiness={handleSelectBusiness}
        selectedBusiness={selectedBusiness}
      />

      <GenericDataTable<DTO_OrdenServicio>
        title="Órdenes de Servicio"
        columnKeys={columnKeysOrdenDeServicio}
        labelMap={labelMapOrdenDeServicio}
        data={ordenes}
        onAdd={openNewModal}
        onEdit={() => {
          /*…*/
        }}
        onDelete={() => {
          /*…*/
        }}
        disableButtonAdd={false}
        includeEstadoColumn
        includeReferenceColumn
      />

      <GenericFormModal<DTO_OrdenServicio>
        title="Registrar Orden de Servicio"
        show={isModalOpen}
        onHide={() => setConfirmOpen(true)}
        data={formData}
        setData={setFormData}
        onSubmit={saveNewOrder}
        fields={formFields}
      />

      <ConfirmModal
        show={confirmOpen}
        confirmMessage="¿Cancelar registro?"
        onAction={(ok) => {
          if (ok) setIsModalOpen(false);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
};
