// ✅ RP-19: Pantalla Transacciones adaptada a estructura definitiva (estado local, sin refetch completo, edición con lógica de cuentas)

import { useEffect, useState, useRef } from "react";
import { DTO_Negocio, DTO_Transacciones, DTO_Respuesta } from "@/models";
import {
  BusinessButtons,
  ConfirmModal,
  FieldConfig,
  GenericDataTable,
  GenericFormModal,
  InfoPanel,
  LoadingPanel,
  RestriccionModal,
} from "@/components";
import {
  labelMapTransacciones,
  columnKeysTransacciones,
  transaccionesFormEditFields,
  keysInfoModalTransacciones,
} from "@/utils";
import { errorHelpers, notificationHelpers, procesarRespuesta } from "@/utils";
import { STATUS_TBL } from "@/constants";
import { transaccionesService } from "@/services/transacciones.service";

export const Transacciones = () => {
  //#region 🔄 Estado y carga
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [transacciones, setTransacciones] = useState<DTO_Transacciones[]>([]);
  const [loading, setLoading] = useState(false);
  const [disableButtonAdd, setDisableButtonAdd] = useState(true);
  //#endregion

  //#region ➕ Registro
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_Transacciones>(
    new DTO_Transacciones()
  );
  //#endregion

  //#region ✏️ Edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<DTO_Transacciones | null>(null);
  const [rowEditSelected, setRowEditSelected] =
    useState<DTO_Transacciones | null>(null);
  //#endregion

  //#region 🗑 Confirmación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [transToDelete, setTransToDelete] = useState<DTO_Transacciones | null>(
    null
  );
  //#endregion

  //#region ⚠️ Modal restricción
  const [isModalRestriccionOpen, setIsModalRestriccionOpen] = useState(false);
  //#endregion

  //#region 📦 Efecto principal
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
      next: (result) => {
        const lista = procesarRespuesta(
          result as DTO_Respuesta
        ) as DTO_Transacciones[];
        setTransacciones(
          lista.filter(
            (t) => t.estado?.iD_Estado !== STATUS_TBL.TRANSACTION.DELETED
          )
        );
      },
      error: errorHelpers.serverError,
      complete: () => setLoading(false),
    });
  };
  //#endregion

  //#region ✅ Crear
  const handleAddNew = () => {
    setFormData(new DTO_Transacciones());
    setIsModalFormOpen(true);
  };

  const handleSave = () => {
    formData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
    transaccionesService.registrarTransaccion(formData).subscribe({
      next: (result) => {
        const nueva = (result.resultado as DTO_Transacciones[])[0];
        // ✅ Filtramos si no es eliminado antes de agregar
        if (nueva.estado?.iD_Estado !== STATUS_TBL.TRANSACTION.DELETED) {
          setTransacciones((prev) => [nueva, ...prev]);
        }
        notificationHelpers.successAlert(result.mensaje);
        setIsModalFormOpen(false);
      },
      error: errorHelpers.serverError,
    });
  };

  const handleCancelAdd = () => {
    setConfirmModalMessage("¿Deseas cancelar el registro de la transacción?");
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };
  //#endregion

  //#region 🛠 Editar
  const handleEdit = (rowData: DTO_Transacciones) => {
    setRowEditSelected(rowData);
    setEditData({ ...rowData });
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedData: DTO_Transacciones) => {
    if (!rowEditSelected) return;
    updatedData.iD_Transaccion = rowEditSelected.iD_Transaccion;
    updatedData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;

    if (!updatedData.estado?.iD_Estado && rowEditSelected.estado?.iD_Estado) {
      updatedData.estado = { ...rowEditSelected.estado };
    }

    transaccionesService.actualizarTransaccion(updatedData).subscribe({
      next: () => {
        // ✅ Si sigue activo, actualizar; si fue eliminado, eliminar de lista
        setTransacciones((prev) =>
          updatedData.estado?.iD_Estado !== STATUS_TBL.TRANSACTION.DELETED
            ? prev.map((t) =>
                t.iD_Transaccion === updatedData.iD_Transaccion
                  ? updatedData
                  : t
              )
            : prev.filter(
                (t) => t.iD_Transaccion !== updatedData.iD_Transaccion
              )
        );
        notificationHelpers.successAlert(
          "Transacción actualizada correctamente"
        );
        setShowEditModal(false);
      },
      error: errorHelpers.serverError,
    });
  };
  //#endregion

  //#region 🗑 Eliminar lógica
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
          iD_Estado: STATUS_TBL.TRANSACTION.DELETED,
        },
        iD_Negocio: selectedBusiness?.iD_Negocio || 0,
      };
      setTransacciones((prev) =>
        prev.filter((t) => t.iD_Transaccion !== updated.iD_Transaccion)
      );
      transaccionesService.actualizarTransaccion(updated).subscribe({
        next: () => notificationHelpers.infoAlert("Transacción eliminada"),
        error: errorHelpers.serverError,
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
  //#endregion

  //#region 🧾 Campos edición (cuenta bloqueada)
  const CuentaFieldRenderer = ({
    field,
    editData,
  }: {
    field: FieldConfig<DTO_Transacciones>;
    editData: DTO_Transacciones | null;
  }) => {
    const infoIconRef = useRef<HTMLElement>(null);
    useEffect(() => {
      if (infoIconRef.current && (window as any).bootstrap) {
        new (window as any).bootstrap.Tooltip(infoIconRef.current);
      }
    }, []);
    return (
      <div className="d-flex align-items-center gap-2">
        <input
          type="text"
          className="form-control form-control-solid null"
          value={String(editData?.[field.key] ?? "")}
          disabled
        />
        <i
          ref={infoIconRef}
          className="bi bi-info-circle-fill text-info"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Esta es una transacción creada automáticamente desde una cuenta. Para modificarla, elimínela y créela manualmente."
        />
      </div>
    );
  };

  const editFormFields: FieldConfig<DTO_Transacciones>[] =
    transaccionesFormEditFields.map((field) => {
      const esCuenta =
        editData?.tipoNumReferencia?.trim().toLowerCase() === "cuenta";
      if (
        esCuenta &&
        (field.key === "tipoNumReferencia" || field.key === "numReferencia")
      ) {
        return {
          ...field,
          type: "custom",
          renderer: () => (
            <CuentaFieldRenderer field={field} editData={editData} />
          ),
        };
      }
      return field;
    });
  //#endregion

  //#region 🎨 Render
  return (
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          disableButtonAdd={disableButtonAdd}
          includeEstadoColumn
          customRenderers={{
            monto: (val: unknown) =>
              new Intl.NumberFormat("es-CR", {
                style: "currency",
                currency: "CRC",
                minimumFractionDigits: 2,
              }).format(Number(val) || 0),
            fechaTransaccion: (val: unknown) =>
              val ? new Date(String(val)).toLocaleDateString() : "",
          }}
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
        fields={transaccionesFormEditFields}
      />

      <GenericFormModal<DTO_Transacciones>
        title="Editar Transacción"
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        data={editData!}
        setData={(x) => setEditData(x as DTO_Transacciones)}
        onSubmit={() => editData && handleSaveEdit(editData)}
        fields={editFormFields}
      />

      <ConfirmModal
        show={isConfirmOpen}
        confirmMessage={confirmModalMessage}
        onAction={confirmModalAction}
      />

      <RestriccionModal
        modalTitle="Acción no permitida"
        modalTexto="No tienes permisos para modificar esta transacción porque fue creada automáticamente desde el módulo de cuentas. Si deseas cambiar algo, primero debes eliminarla y luego crear una nueva transacción con los cambios deseados."
        show={isModalRestriccionOpen}
        onClose={() => setIsModalRestriccionOpen(false)}
      />
    </div>
  );
  //#endregion
};
