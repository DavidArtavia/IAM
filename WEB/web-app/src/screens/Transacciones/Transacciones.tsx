// src/pages/Transacciones.tsx
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

  //Modal editar
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<DTO_Transacciones | null>(null);
  const [rowEditSelected, setRowEditSelected] =
    useState<DTO_Transacciones | null>(null);

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

  const [isModalRestriccionOpen, setIsModalRestriccionOpen] = useState(false);

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

  // editar transacción
  const handleEdit = (rowData: DTO_Transacciones) => {
    setRowEditSelected(rowData);
    setEditData({ ...rowData });
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedData: DTO_Transacciones) => {
    if (!rowEditSelected) return;

    updatedData.iD_Transaccion = rowEditSelected.iD_Transaccion;
    updatedData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;

    // Si no se cambia el estado, mantenemos el anterior
    if (!updatedData.estado?.iD_Estado && rowEditSelected.estado?.iD_Estado) {
      updatedData.estado = { ...rowEditSelected.estado };
    }

    transaccionesService.actualizarTransaccion(updatedData).subscribe({
      next: () => {
        notificationHelpers.successAlert(
          "Transacción actualizada correctamente"
        );
        refetchTransacciones();
        setShowEditModal(false);
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
          iD_Estado: STATUS_TBL.TRANSACTION.DELETED,
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
  
  
  // Custom renderer for "cuenta" fields
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
          value={
            typeof editData?.[field.key] === "string" ||
            typeof editData?.[field.key] === "number"
              ? String(editData?.[field.key])
              : ""
          }
          disabled
          onChange={() => {}}
        />
        <i
          ref={infoIconRef}
          className="bi bi-info-circle-fill text-info"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Esta es una transacción creada automáticamente desde una cuenta. Si necesitas cambiar la referencia, primero elimina esta transacción y luego crea una nueva desde el menú Transacciones."
        />
      </div>
    );
  };
  
  const editFormFields: FieldConfig<DTO_Transacciones>[] =
    transaccionesFormEditFields.map((field) => {
      const esCuenta =
        editData?.tipoNumReferencia?.trim().toLowerCase() === "cuenta";
  
      // Solo personalizamos estos campos si es "cuenta"
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
            onEdit={handleEdit}
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
          fields={transaccionesFormEditFields}
        />

        <GenericFormModal<DTO_Transacciones>
          title="Editar Transacción"
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          data={editData!}
          setData={(x) => setEditData(x as DTO_Transacciones)}
          onSubmit={() => {
            if (editData) handleSaveEdit(editData);
          }}
          fields={editFormFields}
        />

        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={confirmModalAction}
        />

        <RestriccionModal
          modalTitle="Acción no permitida"
          modalTexto="No tienes permisos para modificar esta transacción
           porque fue creada automáticamente desde el módulo de cuentas.
            Si deseas cambiar algo, primero debes eliminarla y 
            luego crear una nueva transacción con los cambios deseados."
          show={isModalRestriccionOpen}
          onClose={() => setIsModalRestriccionOpen(false)}
        />
      </div>
    </>
  );
};
