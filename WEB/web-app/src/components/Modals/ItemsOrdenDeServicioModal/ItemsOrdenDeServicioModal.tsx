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
  const [itemsOrdenes, setItemsOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // #region Registrar
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<any>(new DTO_ItemOrdenServicio());
  // #endregion

  // #region Editar
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
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
      ID_OrdenServicio: rowData.iD_OrdenServicio,
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
    formData.ID_OrdenServicio = rowData?.iD_OrdenServicio || 0;
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
      const updated: any = {
        ...itemOrderToDelete,
        Estado: {
          ...itemOrderToDelete.Estado!,
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
          notificationHelpers.infoAlert(result?.mensaje);
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

    // Limpia editData: si es null/undefined y es número, pone 0; si es string, pone ""
    const editDataCleaned = { ...editData };
    for (const key in editDataCleaned) {
      if (editDataCleaned[key] === null || editDataCleaned[key] === undefined) {
      if (typeof editData[key] === "number") {
        editDataCleaned[key] = 0;
      } else if (typeof editData[key] === "string") {
        editDataCleaned[key] = "";
      } else {
        // Si no se sabe el tipo, por defecto ""
        editDataCleaned[key] = "";
      }
      }
    }

    itemsOrdenesService.actualizarItemsOrdensDeServicio(editDataCleaned).subscribe({
      next: (result) => {
        notificationHelpers.successAlert(result.mensaje);
        setShowEditForm(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  const editFormFields: FieldConfig<any>[] = [
    ...ItemsOrdenServicioFormEditFields,
    {
      key: "Avance",
      label: "Avance",
      type: "custom",
      renderer: () => (
        <>
          <input
            type="range"
            className="form-range"
            min="0"
            max="100"
            step="1"
            id="customRange3"
            value={editData?.avance ?? 0}
            onChange={e => {
              setEditData((prev: any) =>
                prev ? { ...prev, avance: Number(e.target.value) } : null
              );
            }}
          />
          <div>
            <span>Valor actual: {editData?.avance ?? 0}%</span>
          </div>
        </>
      ),
    },
  ];
  // #endregion

  // #region Registrar (campos)
  const registerFormFields: FieldConfig<DTO_ItemOrdenServicio>[] = [
    ...ItemsOrdenServicioFormEditFields,
    {
      key: "Avance",
      label: "Avance",
      type: "custom",
      renderer: () => (
        <>
          <input
            type="range"
            className="form-range"
            min="0"
            max="100"
            step="1"
            id="customRange3"
            value={formData.Avance ?? 0}
            onChange={e => setFormData({ ...formData, Avance: Number(e.target.value) })}
          />
          <div>
            <span>Valor actual: {formData.Avance ?? 0}%</span>
          </div>
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
              <GenericDataTable<any>
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
            <GenericFormModal<any>
              title="Registrar Item de Orden de Servicio"
              show={isModalFormOpen}
              onHide={handleCancelAdd}
              data={formData}
              setData={setFormData}
              onSubmit={handleSave}
              fields={registerFormFields}
            />

            {/* Modal Editar */}
            <GenericFormModal<any>
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
