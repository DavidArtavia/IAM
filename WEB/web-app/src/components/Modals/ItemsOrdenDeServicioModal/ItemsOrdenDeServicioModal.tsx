import { GenericDataTable } from "@/components/Tables/DataTable/GenericDataTable";
import { DTO_ItemOrdenServicio, DTO_Respuesta } from "@/models";
import { itemsOrdenesService } from "@/services";
import { columnKeysItemsOrdenServicio, errorHelpers, ItemsOrdenServicioFormEditFields, keysInfoModalItemsOrdenServicio, labelMapItemsOrdenServicio, notificationHelpers } from "@/utils";
import { useEffect, useState } from "react";
import { GenericFormModal } from "../GenericFormModal/GenericFormModal";
import { ConfirmModal } from "../LoadingModal/ConfirmModal";
import { STATUS_TBL } from "@/constants";
import { FieldConfig } from "../GenericFormModal/types";

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

  // --------- Modales “Registrar” y “Editar” -----------
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_ItemOrdenServicio>(
    new DTO_ItemOrdenServicio()
  );
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<DTO_ItemOrdenServicio | null>(null);
  const [rowEditSelected, setRowEditSelected] =
    useState<DTO_ItemOrdenServicio | null>(null);
  
  const [itemOrderToDelete, setItemOrderToDelete] =
    useState<DTO_ItemOrdenServicio | null>(null);

  // --------- Modal de Confirmación de Borrar / Cancelar -----------
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  // Carga inicial de ítems al abrir el modal
  useEffect(() => {
    if (!open || !rowData?.iD_OrdenServicio) return;

    const request = {
      ID_OrdenServicio: rowData.iD_OrdenServicio,
    } as DTO_ItemOrdenServicio;

    itemsOrdenesService.obtenerItemsOrdensDeServicio(request).subscribe({
      next: (result) => {
        const respuesta = result as DTO_Respuesta;

        // Validación de estructura y tipoRespuesta
        if (!respuesta.tipoRespuesta) {
          // Notificar error usando notificationHelpers, no errorHelpers.serverError
          notificationHelpers.errorAlert(
            respuesta.mensaje || "Error al cargar ítems"
          );
          return;
        }

        // El SP devuelve: resultado: [ [ array de DTO_ItemOrdenServicio ] ]
        const raw = respuesta.resultado?.[0];
        const items = Array.isArray(raw)
          ? (raw as DTO_ItemOrdenServicio[])
          : [];

        console.log("Items obtenidos:", items);

        setItemsOrdenes(items);
      },
      error: errorHelpers.serverError,
    });
  }, [open, rowData]);
  // ======== “Registrar” ========
  const handleAddNew = () => {
    setFormData(new DTO_ItemOrdenServicio());
    setIsModalFormOpen(true);
  };
  const handleSave = () => {
    formData.ID_OrdenServicio = rowData?.iD_OrdenServicio || 0;
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
  // ======== Manejo de confirmación de “Cancelar registro” o “Eliminar”  ========

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

   // --------------------------------------------------
    // 5.1 EDITAR ESTADO A ELIMINADO: preparar datos
    // --------------------------------------------------
  
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
        // 1) Clonamos la orden original y cambiamos solo el estado:
        const updated: DTO_ItemOrdenServicio = {
          ...itemOrderToDelete,
          Estado: {
            ...itemOrderToDelete.Estado!,
            iD_Estado: STATUS_TBL.ITEMS_ORDER_SERVICE.DELETED,
          },
        };
        // 3) Refrescar tabla local con las fechas saneadas únicamente cuando hacían falta
        setItemsOrdenes((prev) =>
          prev.map((item) =>
            item.ID_ItemOrdenServicio === updated.ID_ItemOrdenServicio
              ? updated
              : item
          )
        );

        // 4) Llamar al servicio con el objeto limpio
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

        validate: (val) => {
          if (!Array.isArray(val) || val.length === 0) return "";
          for (const ref of val) {
            if (!ref.nombre) return "Todos los campos deben estar completos.";
          }
          return "";
        },
      },
    ];
  // Renderizadores personalizados para columnas específicas
  const customRenderers: {
    [K in keyof any]?: (
      value: unknown,
      rowData: DTO_ItemOrdenServicio
    ) => string | number | React.ReactNode;
  } = {
    monto: (val: unknown) => {
      // formateo de números en colones
      return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 2,
      }).format(Number(val) || 0);
    },
  };

  // Evita renderizar el modal si no está abierto
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
            <GenericDataTable<any>
              title="Ítems de la Orden de Servicio"
              columnKeys={columnKeysItemsOrdenServicio}
              labelMap={labelMapItemsOrdenServicio}
              data={itemsOrdenes}
              onAdd={handleAddNew}
              onEdit={() => {}}
              onDelete={handleDelete}
              onOpenItemsModal={() => {}}
              disableButtonAdd={false}
              customRenderers={customRenderers}
              includeEstadoColumn
              modalInfoFields={keysInfoModalItemsOrdenServicio}
            />

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

            {/* === Modal Genérico: Confirmación === */}
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
