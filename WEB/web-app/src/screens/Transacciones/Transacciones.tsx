// src/pages/Transacciones.tsx
import { useEffect, useState } from "react";
import { DTO_Negocio, DTO_Transacciones, DTO_Respuesta } from "@/models";
import {
  BusinessButtons,
  ConfirmModal,
  GenericDataTable,
  GenericFormModal,
  InfoPanel,
  LoadingPanel,
} from "@/components";
import {
  labelMapTransacciones,
  columnKeysTransacciones,
  transaccionesFormFields,
  keysInfoModalTransacciones,
} from "@/utils";
import { errorHelpers, notificationHelpers, procesarRespuesta } from "@/utils";
import { STATUS_TBL } from "@/constants";
import { transaccionesService } from "@/services/transacciones.service";

export const Transacciones = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [transacciones, setTransacciones] = useState<DTO_Transacciones[]>([]);
  const [disableButtonAdd, setDisableButtonAdd] = useState(true);

  // Modal Registro
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_Transacciones>(
    new DTO_Transacciones()
  );
  const [loading, setLoading] = useState(false);

  // Confirmación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [transToDelete, setTransToDelete] = useState<DTO_Transacciones | null>(
    null
  );

  useEffect(() => {
    if (selectedBusiness) refetchTransacciones();
  }, [selectedBusiness]);

  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setDisableButtonAdd(false);
  };

  const refetchTransacciones = () => {
    if (!selectedBusiness) return;
    setLoading(true);
    transaccionesService.obtenerTransaccion(selectedBusiness).subscribe({
      next: (result) =>
        setTransacciones(
          (procesarRespuesta(result as DTO_Respuesta) as DTO_Transacciones[]) ||
            []
        ),
      error: (err) => errorHelpers.serverError(err),
      complete: () => setLoading(false),
    });
  };

  const handleAddNew = () => {
    setFormData(new DTO_Transacciones());
    setIsModalFormOpen(true);
  };

  const handleSave = () => {
    formData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
    transaccionesService.registrarTransaccion(formData).subscribe({
      next: (result) => {
        notificationHelpers.successAlert(
          result.mensaje || "Transacción registrada"
        );
        refetchTransacciones();
        setIsModalFormOpen(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  const handleCancelAdd = () => {
    setConfirmModalMessage("¿Deseas cancelar el registro de la transacción?");
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };

  const handleDelete = (rowData: DTO_Transacciones) => {
    setTransToDelete(rowData);
    setConfirmModalMessage("¿Deseas eliminar esta transacción?");
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = (action: boolean | null) => {
    if (action && transToDelete) {
      const updated: DTO_Transacciones = {
        ...transToDelete,
        estado: {
          ...transToDelete.estado,
          iD_Estado: STATUS_TBL.TRANSACTION.DELETED
        },
        iD_Negocio: selectedBusiness?.iD_Negocio || 0,
      };
      transaccionesService.actualizarTransaccion(updated).subscribe({
        next: () => {
          notificationHelpers.infoAlert("Transacción eliminada");
          refetchTransacciones();
        },
        error: (err) => errorHelpers.serverError(err),
      });
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };

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
  };

  const customRenderers = {
    monto: (val: unknown) =>
      new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 2,
      }).format(Number(val) || 0),
    fechaTransaccion: (val: unknown) => {
      if (!val) return "";
      return new Date(String(val)).toLocaleDateString();
    },
  };

  return (
    <>
      <div className="row p-4 col-12 gx-0">
        <BusinessButtons
          handleSelectBusiness={handleSelectBusiness}
          title="Negocios"
          selectedBusiness={selectedBusiness}
        />

        {loading ? (
          <LoadingPanel msj="Cargando transacciones..." />
        ) : selectedBusiness ? (
          <GenericDataTable<DTO_Transacciones>
            title="Transacciones"
            columnKeys={columnKeysTransacciones}
            labelMap={labelMapTransacciones}
            data={transacciones}
            onAdd={handleAddNew}
            onEdit={() => { console.log(transacciones);
            }} // Por ahora desactivado
            onDelete={handleDelete}
            disableButtonAdd={disableButtonAdd}
            includeEstadoColumn
            customRenderers={customRenderers}
            modalInfoFields={keysInfoModalTransacciones}
            datekeys={["fechaTransaccion"]}
          />
        ) : (
          <InfoPanel msj="Selecciona un negocio para ver sus transacciones." />
        )}

        <GenericFormModal<DTO_Transacciones>
          title="Registrar Transacción"
          show={isModalFormOpen}
          onHide={handleCancelAdd}
          data={formData}
          setData={setFormData}
          onSubmit={handleSave}
          fields={transaccionesFormFields}
        />

        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={confirmModalAction}
        />
      </div>
    </>
  );
};
