import {
  BusinessButtons,
  ConfirmModal,
  GenericDataTable,
  GenericFormModal,
} from "@/components";
import { DTO_Negocio, DTO_OrdenServicio, DTO_Respuesta } from "@/models";
import { ordenesService } from "@/services";
import { columnKeysOrdenDeServicio, errorHelpers, notificationHelpers, ordenServicioFormEditFields } from "@/utils";
import { useState } from "react";

export const OrdenDeServicio = () => {
  // Estado para manejar el negocio seleccionado
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  // --------- Modal de Confirmación de Borrar / Cancelar -----------
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(true);

  // --------- Modales “Registrar” y “Editar” -----------
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_OrdenServicio>(
    new DTO_OrdenServicio()
  );

  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setDisableButtonAdd(false);
  };

  // ======== “Registrar” ========
  const handleAddNew = () => {
    setFormData(new DTO_OrdenServicio());
    setIsModalFormOpen(true);
  };
  const handleSave = () => {
    formData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
    formData.referenciaJSON = selectedBusiness?.referenciaJSON ?? [];
    ordenesService.registrarOrdensDeServicio(formData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ||
          "Orden registrada correctamente";
        notificationHelpers.successAlert(mensaje);
        setIsModalFormOpen(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  const handleCancelAdd = () => {
    setConfirmModalMessage("¿Estás seguro de que deseas cancelar el registro?");
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };

  // ======== Manejo de confirmación de “Cancelar registro” o “Eliminar”  ========
  const confirmModalAction = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsModalFormOpen(false);
        notificationHelpers.infoAlert("Registro cancelado");
      } else if (confirmContext === "delete") {
        // handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };

  return (
    <div className="row p-4 col-12 gx-0">
      {/* Selección de negocio */}
      <BusinessButtons
        title="Negocios"
        handleSelectBusiness={handleSelectBusiness}
        selectedBusiness={selectedBusiness}
      />
      {/* Tabla GENÉRICA */}
      <GenericDataTable<DTO_OrdenServicio>
        title="Orden de Servicio"
        columnKeys={[]}
        labelMap={{}}
        data={[]}
        onAdd={handleAddNew}
        onEdit={() => {}}
        onDelete={() => {}}
        disableButtonAdd={disableButtonAdd}
        includeEstadoColumn={false}
        includeReferenceColumn={false}
        customRenderers={{}}
      />

      {/* Modal “Registrar” */}
      <GenericFormModal<DTO_OrdenServicio>
        title="Registrar Orden de Servicio"
        show={isModalFormOpen}
        onHide={handleCancelAdd}
        data={formData}
        setData={setFormData}
        onSubmit={handleSave}
        fields={ordenServicioFormEditFields} // Aquí deberías definir los campos del formulario
      />

      {/* Modal “Confirmación” */}
      <ConfirmModal
        show={isConfirmOpen}
        confirmMessage={confirmModalMessage}
        onAction={confirmModalAction}
      />
    </div>
  );
};
