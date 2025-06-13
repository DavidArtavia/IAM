// src/pages/Monitor.tsx
import React, { useEffect, useState } from "react";
import { DTO_Negocio, DTO_CuentasPorPagar, DTO_Respuesta } from "@/models";
import { cuentasService } from "@/services";
import {
  errorHelpers,
  notificationHelpers,
  procesarRespuesta,
  labelMapCuentasPorPagar,
  cuentasFormEditFields,
  columnKeysCuentasPorPagar,
} from "@/utils";
import {
  BusinessButtons,
  ConfirmModal,
  GenericDataTable,
  GenericFormModal,
} from "@/components";
import { STATUS_TBL } from "@/constants";

export const Cuentas = () => {
  // Estado de negocio seleccionado
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  // Arreglo con DTO_CuentasPorPagar
  const [accountsPayable, setAccountsPayable] = useState<DTO_CuentasPorPagar[]>(
    []
  );
  const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(true);

  // --------- Modales “Registrar” y “Editar” -----------
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_CuentasPorPagar>(
    new DTO_CuentasPorPagar()
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<DTO_CuentasPorPagar | null>(null);
  const [rowEditSelected, setRowEditSelected] =
    useState<DTO_CuentasPorPagar | null>(null);

  // --------- Modal de Confirmación de Borrar / Cancelar -----------
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
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

  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setDisableButtonAdd(false);
  };

  // Refetch de Cuentas por Pagar
  const refetchAccounts = () => {
    if (!selectedBusiness) return;
    cuentasService.obtenerCuentasPorPagar(selectedBusiness).subscribe({
      next: (result) =>
        setAccountsPayable(
          (procesarRespuesta(
            result as unknown as DTO_Respuesta
          ) as DTO_CuentasPorPagar[]) || []
        ),
      error: (err) => errorHelpers.serverError(err),
    });
  };

  // ======== “Registrar” ========
  const handleAddNew = () => {
    setFormData(new DTO_CuentasPorPagar());
    setIsModalFormOpen(true);
  };
  const handleSave = () => {
    formData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
    cuentasService.registrarCuentasPorPagar(formData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ||
          "Cuenta registrada correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
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

  // ======== “Editar” ========
  const handleEdit = (rowData: DTO_CuentasPorPagar) => {
    setRowEditSelected(rowData);
    setEditData({ ...rowData }); // Hacemos copia para evitar mutar el original
    setShowEditModal(true);
  };
  const handleSaveEdit = (updatedData: DTO_CuentasPorPagar) => {
    if (!rowEditSelected) return;
    updatedData.iD_CuentasPorPagar = rowEditSelected.iD_CuentasPorPagar;
    updatedData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
    // Si no cambió “estado”, lo conservamos
    if (!updatedData.estado && rowEditSelected.estado) {
      updatedData.estado = { ...rowEditSelected.estado };
    }

    cuentasService.actualizarCuentasPorPagar(updatedData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ||
          "Cuenta actualizada correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
        setShowEditModal(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  // ======== “Eliminar” ========
  const handleDelete = (rowData: DTO_CuentasPorPagar) => {
    setConfirmModalMessage("¿Estás seguro de que deseas eliminar esta cuenta?");
    setAccountToDelete(rowData);
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };
  const handleConfirmDelete = (action: boolean | null) => {
    if (action && accountToDelete) {
      const updatedData: DTO_CuentasPorPagar = {
        ...accountToDelete,
        estado: {
          ...accountToDelete.estado!,
          iD_Estado: STATUS_TBL.ACCOUNT_PAYABLE.DELETED,
        },
        iD_Negocio: selectedBusiness?.iD_Negocio || 0,
      };
      cuentasService.actualizarCuentasPorPagar(updatedData).subscribe({
        next: (result) => {
          notificationHelpers.infoAlert(
            result.mensaje ?? "Cuenta eliminada correctamente"
          );
          refetchAccounts();
        },
        error: (err) => errorHelpers.serverError(err),
      });
      setAccountToDelete(null);
    }
    setIsConfirmOpen(false);
  };

  // ======== Manejo de confirmación de “Cancelar registro” o “Eliminar”  ========
  const confirmModalAction = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsModalFormOpen(false);
        notificationHelpers.infoAlert("Registro cancelado");
      } else if (confirmContext === "delete") {
        handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };

  //este renderizador personalizado formatea los valores de las columnas
  const customRenderers: {
    [K in keyof DTO_CuentasPorPagar]?: (
      value: unknown,
      rowData: DTO_CuentasPorPagar
    ) => string | number | React.ReactNode;
  } = {
    saldo: (val: unknown) => {
      // formateo de números en colones
      return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 2,
      }).format(Number(val) || 0);
    },
    fechaInicial: (val: unknown) => {
      if (!val) return "";
      return new Date(String(val)).toLocaleDateString();
    },
    fechaModificacion: (val: unknown) => {
      if (!val) return "";
      return new Date(String(val)).toLocaleDateString();
    },
  };

  return (
    <>
      <div className="row p-4 col-12 gx-0">
        {/* Selección de negocio */}
        <BusinessButtons
          handleSelectBusiness={handleSelectBusiness}
          title="Negocios"
          selectedBusiness={selectedBusiness}
        />

        {/* Tabla GENÉRICA */}
        <GenericDataTable<DTO_CuentasPorPagar>
          title="Cuentas por Pagar"
          columnKeys={columnKeysCuentasPorPagar}
          labelMap={labelMapCuentasPorPagar}
          data={accountsPayable}
          onAdd={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          disableButtonAdd={disableButtonAdd}
          includeEstadoColumn={true} // añade automáticamente la columna “Estado”
          customRenderers={customRenderers}
        />

        {/* Modal “Registrar” */}
        <GenericFormModal<DTO_CuentasPorPagar>
          title="Registrar Cuenta por Pagar"
          show={isModalFormOpen}
          onHide={handleCancelAdd}
          data={formData}
          setData={setFormData}
          onSubmit={handleSave}
          fields={cuentasFormEditFields}
        />

        {/* Modal “Confirmación” */}
        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={confirmModalAction}
        />

        {/* Modal “Editar” */}
        <GenericFormModal<DTO_CuentasPorPagar>
          title="Editar Cuenta por Pagar"
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          data={editData!}
          setData={(x) => setEditData(x as DTO_CuentasPorPagar)}
          onSubmit={() => {
            if (editData) {
              handleSaveEdit(editData);
            }
          }}
          fields={cuentasFormEditFields}
        />
      </div>
    </>
  );
};
