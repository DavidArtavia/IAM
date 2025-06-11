import { ConfirmModal, GenericDataTable, GenericFormModal } from "@/components";
import { FILTER_STATUS, STATUS_TBL } from "@/constants";
import { AuthContext } from "@/context";
import { DTO_Negocio, DTO_Respuesta, DTO_FiltroEstado } from "@/models";
import { negocioService } from "@/services";
import {
  columnKeysNegocio,
  errorHelpers,
  labelMapNegocio,
  negocioFormEditFields,
  notificationHelpers,
  procesarRespuesta,
} from "@/utils";
import { useContext, useEffect, useState } from "react";

export const Negocio = () => {
  // === Contexto pa aobtenr datos de usuario ===
  const { user } = useContext(AuthContext);
  // === Estados principales ===
  const [business, setBusiness] = useState<Array<DTO_Negocio>>([]);
  const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(false);
  // Estado para el filtro de estado, inicia en "ACTIVO"
  const [filtroEstado, setFiltroEstado] = useState<DTO_FiltroEstado>({
    filtroEstado: FILTER_STATUS.ACTIVO,
  });

  // === Modal “Registrar” (Genérico) ===
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_Negocio>(new DTO_Negocio());

  // === Modal “Editar” (Genérico) ===
  const [showBusiness, setShowBusinessModal] = useState(false);
  const [editData, setEditData] = useState<DTO_Negocio | null>(null);
  const [rowBusinessSelected, setRowBusinessSelected] =
    useState<DTO_Negocio | null>(null);

  // --------- Modal de Confirmación de Borrar / Cancelar -----------

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  const [businessToDelete, setBusinessToDelete] = useState<DTO_Negocio | null>(
    null
  );

  // === Efecto para cargar los negocios al iniciar ===
  useEffect(() => {
    refetchAccounts();
  }, [filtroEstado]);

  // === Refetch O obtener Negocios ===
  const refetchAccounts = () => {
    
    negocioService.obtenerNegocios(filtroEstado).subscribe({
      next: (result) => {
        setBusiness(
          procesarRespuesta(result as DTO_Respuesta) as Array<DTO_Negocio>
        );
      },
      error: (err) => errorHelpers.serverError(err),
      complete: () => {
        // if (business.length <= 3) {
        //   setDisableButtonAdd(true);
        // }
      },
    });
  };
  // ========== “Registrar” ==========

  const handleAddNewBusiness = () => {
    setFormData(new DTO_Negocio());
    setIsModalFormOpen(true);
  };

  const handleSave = () => {
    formData.iD_Usuario = user?.iD_Usuario || 0;
    negocioService.registrarNegocio(formData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ??
          "Negocio registrado correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
        setIsModalFormOpen(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  //
  const handleCancel = () => {
    setConfirmModalMessage("¿Estás seguro de que deseas cancelar?");
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };

  // ========== “Editar” ==========
  const handleEdit = (rowData: DTO_Negocio) => {
    setRowBusinessSelected(rowData);
    setEditData({ ...rowData });
    setShowBusinessModal(true);
  };

  const handleSaveBusiness = (updatedData: DTO_Negocio) => {
    if (!rowBusinessSelected) return;
    updatedData.iD_Negocio = rowBusinessSelected.iD_Negocio;
    updatedData.iD_Usuario = user?.iD_Usuario || 0;

    // Si no cambiaron el estado, lo dejamos como estaba
    if (!updatedData.estado && rowBusinessSelected.estado) {
      updatedData.estado = { ...rowBusinessSelected.estado };
    }

    negocioService.actualizarNegocio(updatedData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ??
          "Negocio actualizado correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
        setShowBusinessModal(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  // ======== “Eliminar” ========
  const handleDelete = (rowData: DTO_Negocio) => {
    setConfirmModalMessage(
      `¿Estás seguro de que deseas eliminar el negocio ${rowData.nombreNegocio} ?`
    );
    setBusinessToDelete(rowData);
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };
  const handleConfirmDelete = (action: boolean | null) => {
    if (action && businessToDelete) {
      const updatedData: DTO_Negocio = {
        ...businessToDelete,
        estado: {
          ...businessToDelete.estado!,
          iD_Estado: STATUS_TBL.BUSINESS.DELETED, // Marcamos como eliminado
        },
      };
      negocioService.actualizarNegocio(updatedData).subscribe({
        next: (result) => {
          notificationHelpers.infoAlert( result?.mensaje );
          refetchAccounts();
        },
        error: (err) => errorHelpers.serverError(err),
      });
      setBusinessToDelete(null);
    }
    setIsConfirmOpen(false);
  };

  // ======== Manejo de confirmación de “Cancelar registro” o “Eliminar”  ========

  const confirmModalAcion = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsModalFormOpen(false);
        notificationHelpers.infoAlert("Cambios descartados correctamente");
      } else if (confirmContext === "delete") {
        handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };

  // ========== Renderizado de columnas personalizadas ==========
  const customRenderers: {
    [K in keyof DTO_Negocio]?: (
      value: unknown,
      rowData: DTO_Negocio
    ) => string | number | React.ReactNode;
  } = {
    fechaRegistro: (val: unknown) => {
      if (!val) return "";
      return new Date(String(val)).toLocaleDateString();
    },
  };

  return (
    <>
      <div className="row p-4 col-12 gx-0">
        {/* Tabla GENÉRICA */}
        <GenericDataTable<DTO_Negocio>
          title="Negocios"
          columnKeys={columnKeysNegocio}
          labelMap={labelMapNegocio}
          data={business}
          onAdd={handleAddNewBusiness}
          onEdit={handleEdit}
          onDelete={handleDelete}
          disableButtonAdd={disableButtonAdd}
          includeEstadoColumn={true} // añade automáticamente la columna “Estado”
          includeReferenceColumn={true} // añade automáticamente la columna “Referencias”
          customRenderers={customRenderers} 
        />

        {/* === Modal Genérico: Registrar Negocios === */}
        <GenericFormModal<DTO_Negocio>
          title="Registrar Negocio"
          show={isModalFormOpen}
          onHide={handleCancel}
          data={formData}
          setData={setFormData}
          onSubmit={handleSave}
          fields={negocioFormEditFields}
        />

        {/* ====== Modal Genérico: Editar Cuenta por Pagar ====== */}
        <GenericFormModal<DTO_Negocio>
          title="Editar datos del Negocio"
          show={showBusiness}
          onHide={() => setShowBusinessModal(false)}
          data={editData!}
          setData={(x) => setEditData(x as DTO_Negocio)}
          onSubmit={() => {
            // Llamamos a handleSaveEdit con el objeto editData
            if (editData) {
              handleSaveBusiness(editData);
            }
          }}
          fields={negocioFormEditFields}
        />

        {/* === Modal Genérico: Confirmación === */}
        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={(action) => confirmModalAcion(action)}
        />
      </div>
    </>
  );
};
