// src/pages/Monitor.tsx  (o donde tengas este componente)
import {
  CuentasPorPagarTable,
  FormRegisterAccountModal,
  ConfirmModal,
} from "@/components";
import { BusinessButtons } from "@/components/Buttons/BusinessButtons";
import { EditModal } from "@/components/Modals/EditModal/EditModal";
import { DTO_Negocio, DTO_CuentasPorPagar, DTO_Respuesta } from "@/models";
import { cuentasService } from "@/services/cuentas.service";
import { errorHelpers, notificationHelpers, procesarRespuesta } from "@/utils";
import { useEffect, useState } from "react";

export const Monitor = () => {
  // =================== Estados Generales ===================
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [accountsPayable, setAccountsPayable] = useState<
    Array<DTO_CuentasPorPagar>
  >([]);
  const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(true);

  // =================== Sección: Modal de Registro ===================
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_CuentasPorPagar>(
    new DTO_CuentasPorPagar()
  );

  // =================== Sección: Modal de Edición ===================
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<DTO_CuentasPorPagar | null>(null);
  const [rowEditSelected, setRowEditSelected] =
    useState<DTO_CuentasPorPagar | null>(null);

  // =================== Sección: Modal de Confirmación ===================
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [confirmModalMessage, setconfirmModalMessage] = useState<string>("");
  const [confirmContext, setConfirmContext] = useState<
    "cancel" | "delete" | null
  >(null);

  // =================== Sección: Eliminar Cuenta ===================
  const [accountToDelete, setAccountToDelete] =
    useState<DTO_CuentasPorPagar | null>(null);

  // =================== Sección: Efectos ===================
  useEffect(() => {
    if (selectedBusiness) {
      refetchAccounts();
    }
  }, [selectedBusiness]);

  // =================== Sección: Negocio ===================
  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setDisableButtonAdd(false);
  };

  // =================== Sección: Consultar Cuentas ===================
  const refetchAccounts = () => {
    if (selectedBusiness) {
      cuentasService.obtenerCuentasPorPagar(selectedBusiness).subscribe({
        next: (result) =>
          setAccountsPayable(
            procesarRespuesta(
              result as unknown as DTO_Respuesta
            ) as Array<DTO_CuentasPorPagar>
          ),
        error: (err) => errorHelpers.serverError(err),
      });
    }
  };

  // =================== Sección: Registrar ===================
  const handleAddNew = () => {
    setIsModalFormOpen(true);
  };

  const handleSave = () => {
    const iD_Negocio = selectedBusiness?.iD_Negocio;
    formData.iD_Negocio = iD_Negocio || 0;

    cuentasService.registrarCuentasPorPagar(formData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ??
          "Cuenta registrada correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
        setIsModalFormOpen(false);
        setFormData(new DTO_CuentasPorPagar());
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  const handleCancel = () => {
    setconfirmModalMessage("¿Estás seguro de que deseas cancelar?");
    setConfirmContext("cancel");
    setIsConfirmOpen(true);
  };

  // =================== Sección: Edicion ===================
  const handleEdit = (rowData: DTO_CuentasPorPagar) => {
    setRowEditSelected(rowData);
    // Pasamos el objeto completo al modal (para que luego el modal clone todas las props)
    setEditData({ ...rowData });
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedData: DTO_CuentasPorPagar) => {
    if (!rowEditSelected) return;

    // Reasignamos IDs obligatorios que el SP necesita:
    updatedData.iD_CuentasPorPagar = rowEditSelected.iD_CuentasPorPagar || 0;
    updatedData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;

    // Si no tocamos “estado” en el formulario, mantenemos el estado original:
    if (!updatedData.estado && rowEditSelected.estado) {
      updatedData.estado = { ...rowEditSelected.estado };
    }

    cuentasService.actualizarCuentasPorPagar(updatedData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ??
          "Cuenta actualizada correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
        setShowEditModal(false);
        setRowEditSelected(null);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  // =================== Sección: Eliminar ===================
  const handleDelete = (rowData: DTO_CuentasPorPagar) => {
    setconfirmModalMessage("¿Estás seguro de que deseas eliminar esta cuenta?");
    setAccountToDelete(rowData);
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = (action: boolean | null) => {
    if (action === true && accountToDelete) {
      const updatedData: DTO_CuentasPorPagar = {
        ...accountToDelete,
        estado: {
          ...accountToDelete.estado,
          iD_Estado: 7, // Por ejemplo, 7 = “Eliminado”
        },
        iD_Negocio: selectedBusiness?.iD_Negocio || 0,
      };

      cuentasService.actualizarCuentasPorPagar(updatedData).subscribe({
        next: () => {
          const mensaje = "Cuenta eliminada correctamente";
          notificationHelpers.infoAlert(mensaje);
          refetchAccounts();
        },
        error: (err) => errorHelpers.serverError(err),
      });

      setAccountToDelete(null);
    }
    setIsConfirmOpen(false);
  };

  // =================== Sección: Confirmaciones Generales ===================
  const confirmModalAcion = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancel") {
        setFormData(new DTO_CuentasPorPagar());
        setIsModalFormOpen(false);
        notificationHelpers.infoAlert("Cambios descartados correctamente");
      } else if (confirmContext === "delete" && accountToDelete) {
        handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };

  // =================== Render ===================
  return (
    <>
      <div className="row p-4 col-12 gx-0">
        {/* Botones para elegir negocio */}
        <BusinessButtons
          handleSelectBusiness={handleSelectBusiness}
          title="Negocios"
          selectedBusiness={selectedBusiness}
        />

        {/* Tabla de Cuentas por Pagar */}
        <CuentasPorPagarTable
          data={accountsPayable}
          onAdd={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          disableButtonAdd={disableButtonAdd}
        />

        {/* Modal de Agregar Cuenta */}
        <FormRegisterAccountModal
          show={isModalFormOpen}
          onHide={handleCancel}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSave}
        />

        {/* Modal Genérico de Confirmación (cancelar o eliminar) */}
        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={(action) => confirmModalAcion(action)}
        />

        {/* Modal Genérico de Edición */}
        <EditModal<DTO_CuentasPorPagar>
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          data={editData}
          onSave={handleSaveEdit}
          fieldsToEdit={["concepto", "descripcion", "saldo"]}
          labelMap={{
            concepto: "Concepto",
            descripcion: "Descripción",
            saldo: "Saldo",
          }}
        />
      </div>
    </>
  );
};
