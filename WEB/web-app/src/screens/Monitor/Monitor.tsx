// src/pages/Monitor.tsx
import { CuentasPorPagarTable, ConfirmModal, GenericFormModal } from "@/components";
import { BusinessButtons } from "@/components/Buttons/BusinessButtons";

import { DTO_Negocio, DTO_CuentasPorPagar, DTO_Respuesta } from "@/models";
import { cuentasService } from "@/services";
import { cuentasFormFields, errorHelpers, notificationHelpers, procesarRespuesta } from "@/utils";
import { useEffect, useState } from "react";

export const Monitor = () => {
  // === Estados principales ===
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [accountsPayable, setAccountsPayable] = useState<
    Array<DTO_CuentasPorPagar>
  >([]);
  const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(true);

  // === Modal “Registrar” (Genérico) ===
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_CuentasPorPagar>(
    new DTO_CuentasPorPagar()
  );

  // === Modal “Editar” (Genérico) ===
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<DTO_CuentasPorPagar | null>(null);
  const [rowEditSelected, setRowEditSelected] =
    useState<DTO_CuentasPorPagar | null>(null);

  // === Modal de Confirmación ===
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setconfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  const [accountToDelete, setAccountToDelete] =
    useState<DTO_CuentasPorPagar | null>(null);

  // Cuando cambia el negocio, recargamos cuentas
  useEffect(() => {
    if (selectedBusiness) {
      refetchAccounts();
    }
  }, [selectedBusiness]);

  // === Selección de negocio ===
  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setDisableButtonAdd(false);
  };

  // === Refetch de Cuentas ===
  const refetchAccounts = () => {
    if (!selectedBusiness) return;
    cuentasService.obtenerCuentasPorPagar(selectedBusiness).subscribe({
      next: (result) =>
        setAccountsPayable(
          procesarRespuesta(
            result as unknown as DTO_Respuesta
          ) as Array<DTO_CuentasPorPagar>
        ),
      error: (err) => errorHelpers.serverError(err),
    });
  };

  // ========== “Registrar” ==========
  const handleAddNew = () => {
    // Limpiamos el DTO antes de abrir el modal
    setFormData(new DTO_CuentasPorPagar());
    setIsModalFormOpen(true);
  };

  const handleSave = () => {
    // En este punto ya asumimos que formData está validado correctamente por FormModal
    formData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
    cuentasService.registrarCuentasPorPagar(formData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ??
          "Cuenta registrada correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
        setIsModalFormOpen(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  const handleCancel = () => {
    setconfirmModalMessage("¿Estás seguro de que deseas cancelar?");
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };

  // ========== “Editar” ==========
  const handleEdit = (rowData: DTO_CuentasPorPagar) => {
    setRowEditSelected(rowData);
    setEditData({ ...rowData }); // Creamos una copia del objeto para evitar mutaciones directas
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedData: DTO_CuentasPorPagar) => {
    if (!rowEditSelected) return;
    updatedData.iD_CuentasPorPagar = rowEditSelected.iD_CuentasPorPagar;
    updatedData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;

    // Si no cambiaron el estado, lo dejamos como estaba
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
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  // ========== “Eliminar” ==========
  const handleDelete = (rowData: DTO_CuentasPorPagar) => {
    setconfirmModalMessage("¿Estás seguro de que deseas eliminar esta cuenta?");
    setAccountToDelete(rowData);
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = (action: boolean | null) => {
    if (action && accountToDelete) {
      const updatedData: DTO_CuentasPorPagar = {
        ...accountToDelete,
        estado: {
          ...accountToDelete.estado,
          iD_Estado: 7, // ID “Eliminado”
        },
        iD_Negocio: selectedBusiness?.iD_Negocio || 0,
      };
      cuentasService.actualizarCuentasPorPagar(updatedData).subscribe({
        next: () => {
          notificationHelpers.infoAlert("Cuenta eliminada correctamente");
          refetchAccounts();
        },
        error: (err) => errorHelpers.serverError(err),
      });
      setAccountToDelete(null);
    }
    setIsConfirmOpen(false);
  };

  // ========== “Confirmaciones” ==========
  const confirmModalAcion = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsModalFormOpen(false);
        notificationHelpers.infoAlert("Cambios descartados correctamente");
      } else if (confirmContext === "delete" && accountToDelete) {
        handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };

  // ========== Render ==========
  return (
    <>
      <div className="row p-4 col-12 gx-0">
        <BusinessButtons
          handleSelectBusiness={handleSelectBusiness}
          title="Negocios"
          selectedBusiness={selectedBusiness}
        />

        <CuentasPorPagarTable
          data={accountsPayable}
          onAdd={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          disableButtonAdd={disableButtonAdd}
        />

        {/* === Modal Genérico: Registrar CuentasPorPagar === */}
        <GenericFormModal<DTO_CuentasPorPagar>
          title="Registrar Cuenta por Pagar"
          show={isModalFormOpen}
          onHide={handleCancel}
          data={formData}
          setData={setFormData}
          onSubmit={handleSave}
          fields={cuentasFormFields}
        />

        {/* === Modal Genérico: Confirmación === */}
        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={(action) => confirmModalAcion(action)}
        />

        {/* ====== Modal Genérico: Editar Cuenta por Pagar ====== */}
        <GenericFormModal<DTO_CuentasPorPagar>
          title="Editar Cuenta por Pagar"
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          data={editData!}
          setData={(x) => setEditData(x as DTO_CuentasPorPagar)}
          onSubmit={() => {
            // Llamamos a handleSaveEdit con el objeto editData
            if (editData) {
              handleSaveEdit(editData);
            }
          }}
          fields={cuentasFormFields}
        />
      </div>
    </>
  );
};
