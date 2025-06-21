import { GenericDataTable } from "@/components/Tables/DataTable/GenericDataTable";
import { DTO_ItemOrdenServicio, DTO_Respuesta } from "@/models";
import { itemsOrdenesService } from "@/services";
import { columnKeysItemsOrdenServicio, errorHelpers, ItemsOrdenServicioFormEditFields, keysInfoModalItemsOrdenServicio, labelMapItemsOrdenServicio, notificationHelpers } from "@/utils";
import { useEffect, useState } from "react";
import { GenericFormModal } from "../GenericFormModal/GenericFormModal";
import { ConfirmModal } from "../LoadingModal/ConfirmModal";
import { STATUS_TBL } from "@/constants";
import { FieldConfig } from "../GenericFormModal/types";
import { LoadingPanel } from "@/components/Panel/LoadingPanel";
import { CustomRange } from "@/components/Range/CustomRange";

interface ItemsOrdenDeServicioModalProps {
  open: boolean;
  onHide: () => void;
  title?: string;
  rowData: Record<string, any>;
}

/**
 * Modal que despliega los ítems de una orden de servicio específica.
 * - Consulta los ítems al abrirse (`open=true`)
 * - Usa la tabla genérica con columnas definidas
 */
export const ItemsOrdenDeServicioModal = ({
  open,
  onHide,
  title = "Detalle del Ítem",
  rowData,
}: ItemsOrdenDeServicioModalProps) => {
  const [itemsOrdenes, setItemsOrdenes] = useState<DTO_ItemOrdenServicio[]>([]);
  const [loading, setLoading] = useState(false);

  // #region Registrar
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_ItemOrdenServicio>(
    new DTO_ItemOrdenServicio()
  );
  // #endregion

  // #region Editar
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<DTO_ItemOrdenServicio>(
    new DTO_ItemOrdenServicio()
  );
  // #endregion

  // #region Eliminar
  const [itemOrderToDelete, setItemOrderToDelete] = useState<DTO_ItemOrdenServicio | null>(null);
  // #endregion

  // #region Confirmación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<"cancelAdd" | "delete" | null>(null);
  // #endregion

  // #region Carga inicial de ítems
  useEffect(() => {
    if (!open || !rowData?.iD_OrdenServicio) return;

    setLoading(true);
    const request = {
      iD_OrdenServicio: rowData.iD_OrdenServicio,
    } as DTO_ItemOrdenServicio;

    itemsOrdenesService.obtenerItemsOrdensDeServicio(request).subscribe({
      next: (result) => {
        const respuesta = result as DTO_Respuesta;
        if (!respuesta.tipoRespuesta) {
          notificationHelpers.errorAlert(
            respuesta.mensaje || "Error al cargar ítems"
          );
          return;
        }
        const raw = respuesta.resultado?.[0];
        const items = Array.isArray(raw)
          ? (raw as DTO_ItemOrdenServicio[])
          : [];
        setItemsOrdenes(items);
      },
      complete: () => setLoading(false),
      error: errorHelpers.serverError,
    });
  }, [open, rowData]);
  // #endregion

  // #region Registrar
  const handleAddNew = () => {
    setFormData(new DTO_ItemOrdenServicio());
    setIsModalFormOpen(true);
  };

  const handleSave = () => {
    formData.iD_OrdenServicio = rowData?.iD_OrdenServicio || 0;
    setItemsOrdenes((prev) =>
      prev.map((item) =>
        item.iD_ItemOrdenServicio === formData.iD_ItemOrdenServicio
          ? formData
          : item
      )
    );
    itemsOrdenesService.registrarItemsOrdensDeServicio(formData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje || "Item registrado correctamente";
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
  // #endregion

  // #region Confirmación
  const confirmModalAcion = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsModalFormOpen(false);
        notificationHelpers.infoAlert("Nueva item descartado correctamente");
      } else if (confirmContext === "delete") {
        handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };
  // #endregion

  // #region Eliminar
  const handleDelete = (Data: any) => {
    setConfirmModalMessage(
      `¿Estás seguro de que deseas eliminar el item ${Data.nombreItemOrdenServicio} ?`
    );
    setItemOrderToDelete(Data);
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = (action: boolean | null) => {
    if (action && itemOrderToDelete) {
      const updated: DTO_ItemOrdenServicio = {
        ...itemOrderToDelete,
        estado: {
          ...itemOrderToDelete.estado!,
          iD_Estado: STATUS_TBL.ITEMS_ORDER_SERVICE.DELETED,
        },
      };
      setItemsOrdenes((prev) =>
        prev.map((item) =>
          item.iD_ItemOrdenServicio === updated.iD_ItemOrdenServicio
            ? updated
            : item
        )
      );
      itemsOrdenesService.actualizarItemsOrdensDeServicio(updated).subscribe({
        next: (result) => {
            notificationHelpers.infoAlert(
              result?.tipoRespuesta
                ? `Ítem #${updated.iD_ItemOrdenServicio} eliminado exitosamente`
                : `${result?.mensaje || "No se pudo eliminar el ítem"}`
            );
        },
        error: (err) => errorHelpers.serverError(err),
      });
      setItemOrderToDelete(null);
    }
    setIsConfirmOpen(false);
  };
  // #endregion

  // #region Editar
  const handleEdit = (row: DTO_ItemOrdenServicio) => {
    setEditData(row);
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    if (!editData) return;
    setItemsOrdenes((prev) =>
      prev.map((item) =>
        item.iD_ItemOrdenServicio === editData.iD_ItemOrdenServicio
          ? editData
          : item
      )
    );

    itemsOrdenesService.actualizarItemsOrdensDeServicio(editData).subscribe({
      next: (result) => {
        notificationHelpers.successAlert(result.mensaje);
        setShowEditForm(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  const editFormFields: FieldConfig<DTO_ItemOrdenServicio>[] = [
    ...ItemsOrdenServicioFormEditFields,
    {
      key: "avance",
      label: "Avance",
      type: "custom",
      renderer: () => (
        <>
          <CustomRange
            data={[editData.avance ?? 0]}
            onChange={(value) => {
              setEditData((prev: any) =>
                prev ? { ...prev, avance: value } : null
              );
            }}
          />
        </>
      ),
    },
  ];
  // #endregion

  // #region Registrar (campos)
  const registerFormFields: FieldConfig<DTO_ItemOrdenServicio>[] = [
    ...ItemsOrdenServicioFormEditFields,
    {
      key: "avance",
      label: "Avance",
      type: "custom",
      renderer: () => (
        <>
          <CustomRange
            data={[formData.avance ?? 0]}
            onChange={(value) => {
              setFormData((prev: any) =>
                prev ? { ...prev, avance: value } : null
              );
            }}
          />
        </>
      ),
    },
  ];
  // #endregion

  // #region Renderizadores personalizados
  const customRenderers: {
    [K in keyof any]?: (
      value: unknown,
      rowData: DTO_ItemOrdenServicio
    ) => string | number | React.ReactNode;
  } = {
    monto: (val: unknown) => {
      return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 2,
      }).format(Number(val) || 0);
    },
  };
  // #endregion

  if (!open) return null;

  return (
    <div
      className="modal fade show d-block shadowClearBackground"
      onClick={onHide}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "95vw", width: "1200px", height: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content resizable-metronic-modal">
          {/* Encabezado */}
          <div className="modal-header cursor-move">
            <h2 className="fw-bold">{title}</h2>
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-color-primary"
              onClick={onHide}
            >
              ✕
            </button>
          </div>

          {/* Contenido */}
          <div className="modal-body py-10 px-lg-17">
            {loading ? (
              <LoadingPanel msj="Cargando Items de la órden de servicio, por favor espere..." />
            ) : (
              <GenericDataTable<DTO_ItemOrdenServicio>
                title="Ítems de la Orden de Servicio"
                columnKeys={columnKeysItemsOrdenServicio}
                labelMap={labelMapItemsOrdenServicio}
                data={itemsOrdenes}
                onAdd={handleAddNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
                customRenderers={customRenderers}
                includeEstadoColumn
                modalInfoFields={keysInfoModalItemsOrdenServicio}
              />
            )}

            {/* Modal Registrar */}
            <GenericFormModal<DTO_ItemOrdenServicio>
              title="Registrar Item de Orden de Servicio"
              show={isModalFormOpen}
              onHide={handleCancelAdd}
              data={formData}
              setData={setFormData}
              onSubmit={handleSave}
              fields={registerFormFields}
            />

            {/* Modal Editar */}
            <GenericFormModal<DTO_ItemOrdenServicio>
              title="Editar Orden de Servicio"
              show={showEditForm}
              onHide={() => setShowEditForm(false)}
              data={editData}
              setData={setEditData}
              onSubmit={handleSaveEdit}
              fields={editFormFields}
            />

            {/* Modal Confirmación */}
            <ConfirmModal
              show={isConfirmOpen}
              confirmMessage={confirmModalMessage}
              onAction={(action) => confirmModalAcion(action)}
            />
          </div>
          {/* Footer */}
          <div className="modal-footer flex-center">
            <button type="button" className="btn btn-primary" onClick={onHide}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
