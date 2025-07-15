// ✅ RP-06: ItemsOrdenDeServicioModal adaptado con manejo local sin refetch y estructura organizada

import { useEffect, useState } from "react";
import { GenericDataTable } from "@/components/Tables/DataTable/GenericDataTable";
import { LoadingPanel } from "@/components/Panel/LoadingPanel";
import { CustomRange } from "@/components/Range/CustomRange";
import {
  columnKeysItemsOrdenServicio,
  labelMapItemsOrdenServicio,
  keysInfoModalItemsOrdenServicio,
  ItemsOrdenServicioFormEditFields,
  notificationHelpers,
  errorHelpers,
  updateItemById,
  formatColones,
} from "@/utils";
import { itemsOrdenesService } from "@/services";
import { STATUS_TBL } from "@/constants";
import { DTO_ItemOrdenServicio, DTO_Respuesta } from "@/models";
import {
  ConfirmModal,
  FieldConfig,
  GenericFormModal,
  InfoModal,
} from "@/components";

interface ItemsOrdenDeServicioModalProps {
  open: boolean;
  onHide: () => void;
  title?: string;
  rowData: Record<string, any>;
}

export const ItemsOrdenDeServicioModal = ({
  open,
  onHide,
  title = "Detalle del Ítem",
  rowData,
}: ItemsOrdenDeServicioModalProps) => {
  //#region 🔄 Estados generales
  const [itemsOrdenes, setItemsOrdenes] = useState<DTO_ItemOrdenServicio[]>([]);
  const [loading, setLoading] = useState(false);
  //#endregion

  //#region ℹ️ info Modal estados;
  const [rowTableSelected, setRowTableSelected] =
    useState<DTO_ItemOrdenServicio>();

  //#endregion

  //#region ➕ Registro
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_ItemOrdenServicio>(
    new DTO_ItemOrdenServicio()
  );
  //#endregion

  //#region ✏️ Edición
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<DTO_ItemOrdenServicio>(
    new DTO_ItemOrdenServicio()
  );
  //#endregion

  //#region 🗑 Eliminación
  const [itemOrderToDelete, setItemOrderToDelete] =
    useState<DTO_ItemOrdenServicio | null>(null);
  //#endregion

  //#region ✅ Confirmación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  //#endregion

  //#region 🚀 Cargar ítems al abrir
  useEffect(() => {
    if (!open || !rowData?.iD_OrdenServicio) return;
    setLoading(true);
    const request = {
      iD_OrdenServicio: rowData.iD_OrdenServicio,
    } as DTO_ItemOrdenServicio;
    itemsOrdenesService.obtenerItemsOrdensDeServicio(request).subscribe({
      next: (result: DTO_Respuesta) => {
        if (!result.tipoRespuesta) {
          notificationHelpers.errorAlert(
            result.mensaje || "Error al cargar ítems"
          );
          return;
        }
        const raw = result.resultado?.[0];
        const items = Array.isArray(raw)
          ? (raw as DTO_ItemOrdenServicio[])
          : [];
        setItemsOrdenes(items);
      },
      complete: () => setLoading(false),
      error: errorHelpers.serverError,
    });
  }, [open, rowData]);
  //#endregion

  //#region 🧩 Agregar nuevo
  const handleAddNew = () => {
    setFormData(new DTO_ItemOrdenServicio());
    setIsModalFormOpen(true);
  };

  const handleSave = () => {
    formData.iD_OrdenServicio = rowData?.iD_OrdenServicio || 0;
    formData.estado = {
      iD_Estado: STATUS_TBL.ITEMS_ORDER_SERVICE.ACTIVE,
      nombre: "activo",
      tabla: "",
    };
    itemsOrdenesService.registrarItemsOrdensDeServicio(formData).subscribe({
      next: (result: DTO_Respuesta) => {
        const nuevo = (result.resultado as DTO_ItemOrdenServicio[])[0];
        if (nuevo) setItemsOrdenes((prev) => [...prev, nuevo]); // Agregar el nuevo ítem
        notificationHelpers.successAlert(result.mensaje);
        setIsModalFormOpen(false);
      },
      error: errorHelpers.serverError,
    });
  };
  //#endregion

  //#region ✏️ Guardar edición
  const handleEdit = (row: DTO_ItemOrdenServicio) => {
    setEditData(row);
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    if (!editData) return;
    itemsOrdenesService.actualizarItemsOrdensDeServicio(editData).subscribe({
      next: (result: DTO_Respuesta) => {
        setItemsOrdenes((prev) =>
          updateItemById(prev, editData, "iD_ItemOrdenServicio")
        );
        notificationHelpers.successAlert(result.mensaje);
        setShowEditForm(false);
      },
      error: errorHelpers.serverError,
    });
  };
  //#endregion

  //#region 🗑 Eliminar
  const handleDelete = (item: DTO_ItemOrdenServicio) => {
    setConfirmModalMessage(
      `¿Estás seguro de eliminar el ítem ${item.nombreItemOrdenServicio}?`
    );
    setItemOrderToDelete(item);
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = (action: boolean | null) => {
    if (action && itemOrderToDelete) {
      const updated = {
        ...itemOrderToDelete,
        estado: {
          ...itemOrderToDelete.estado!,
          iD_Estado: STATUS_TBL.ITEMS_ORDER_SERVICE.DELETED,
        },
      };
      setItemsOrdenes((prev) =>
        updateItemById(prev, updated, "iD_ItemOrdenServicio")
      );
      itemsOrdenesService.actualizarItemsOrdensDeServicio(updated).subscribe({
        next: (result) => {
          notificationHelpers.infoAlert(
            result?.tipoRespuesta
              ? `Ítem #${updated.iD_ItemOrdenServicio} eliminado exitosamente`
              : result?.mensaje || "No se pudo eliminar el ítem"
          );
        },
        error: errorHelpers.serverError,
      });
      setItemOrderToDelete(null);
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };

  const getActiveItemsOrdenes = () =>
    itemsOrdenes.filter(
      (item) =>
        item.estado?.iD_Estado !== STATUS_TBL.ITEMS_ORDER_SERVICE.DELETED
    );
  //#endregion

  //#region ✅ Confirmar cancelación
  const handleCancelAdd = () => {
    setConfirmModalMessage("¿Estás seguro de cancelar el registro?");
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };

  const confirmModalAcion = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsModalFormOpen(false);
        notificationHelpers.infoAlert("Nuevo ítem descartado correctamente");
      } else if (confirmContext === "delete") {
        handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };
  //#endregion

  //#region 🧾 Formularios y renderizadores
  const registerFormFields: FieldConfig<DTO_ItemOrdenServicio>[] = [
    ...ItemsOrdenServicioFormEditFields,
    {
      key: "avance",
      label: "Avance",
      type: "custom",
      renderer: () => (
        <CustomRange
          data={[formData.avance ?? 0]}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, avance: value }))
          }
        />
      ),
    },
  ];

  const editFormFields: FieldConfig<DTO_ItemOrdenServicio>[] = [
    ...ItemsOrdenServicioFormEditFields,
    {
      key: "avance",
      label: "Avance",
      type: "custom",
      renderer: () => (
        <CustomRange
          data={[editData.avance ?? 0]}
          onChange={(value) =>
            setEditData((prev) => ({ ...prev, avance: value }))
          }
        />
      ),
    },
  ];

  const customRenderers = {
    monto: (val: unknown) => formatColones(Number(val) || 0),
  };
  //#endregion

  //#region 🔑 Claves de información para el modal
  const infoModalFields: FieldConfig<DTO_ItemOrdenServicio>[] = [
    ...keysInfoModalItemsOrdenServicio,
    {
      key: "avance",
      label: "Avance",
      type: "custom",
      order: 7,
      renderer: () => {
        const porcentaje = rowTableSelected?.avance ?? 0;
        const barColor =
          porcentaje >= 80
            ? "bg-success"
            : porcentaje >= 50
            ? "bg-warning"
            : "bg-danger";
        return (
          <div
            className="d-flex flex-column w-100 me-2"
            style={{ minWidth: 120 }}
          >
            <div className="d-flex flex-stack mb-2">
              <span className="text-muted me-2 fs-7 fw-bold">
                {porcentaje}%
              </span>
            </div>
            <div className="progress h-6px w-100">
              <div
                className={`progress-bar ${barColor}`}
                role="progressbar"
                style={{ width: `${porcentaje}%` }}
                aria-valuenow={porcentaje}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      key: "monto",
      label: "Monto",
      type: "custom",
      order: 6,
      renderer: () => {
        const value = rowTableSelected?.monto;
        return (
          <div className="border border-gray-200 rounded px-4 py-3 d-flex align-items-center justify-content-between shadow-sm">
            <i className="bi bi-cash-coin fs-4 text-gray-600 me-3"></i>
            <span className="fw-semibold fs-5 text-gray-800"></span>
            {formatColones(Number(value) || 0)}
          </div>
        );
      },
    },
  ];

  //#endregion

  if (!open) return null;

  //#region 🎨 Render
  return (
    <div
      className="modal fade show d-block shadowClearBackground"
      onClick={onHide}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "95vw", width: "1200px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content resizable-metronic-modal">
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
          <div className="modal-body py-10 px-lg-17">
            {loading ? (
              <LoadingPanel msj="Cargando Items de la órden de servicio, por favor espere..." />
            ) : (
              <GenericDataTable
                title="Ítems de la Orden de Servicio"
                columnKeys={columnKeysItemsOrdenServicio}
                labelMap={labelMapItemsOrdenServicio}
                // data={itemsOrdenes}
                data={getActiveItemsOrdenes()}
                onAdd={handleAddNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
                customRenderers={customRenderers}
                includeEstadoColumn
                onRowClick={(row) =>
                  setRowTableSelected(row as DTO_ItemOrdenServicio)
                }
              />
            )}

            <InfoModal
              show={!!rowTableSelected}
              onHide={() => setRowTableSelected(undefined)}
              data={rowTableSelected!}
              fields={infoModalFields}
            />

            <GenericFormModal
              title="Registrar Item de Orden de Servicio"
              show={isModalFormOpen}
              onHide={handleCancelAdd}
              data={formData}
              setData={setFormData}
              onSubmit={handleSave}
              fields={registerFormFields}
            />

            <GenericFormModal
              title="Editar Orden de Servicio"
              show={showEditForm}
              onHide={() => setShowEditForm(false)}
              data={editData}
              setData={setEditData}
              onSubmit={handleSaveEdit}
              fields={editFormFields}
            />

            <ConfirmModal
              show={isConfirmOpen}
              confirmMessage={confirmModalMessage}
              onAction={confirmModalAcion}
            />
          </div>
          <div className="modal-footer flex-center">
            <button type="button" className="btn btn-primary" onClick={onHide}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  //#endregion
};
