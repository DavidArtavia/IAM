import { GenericDataTable } from "@/components/Tables/DataTable/GenericDataTable";
import { DTO_ItemOrdenServicio, DTO_Respuesta } from "@/models";
import { itemsOrdenesService } from "@/services";
import { errorHelpers, notificationHelpers } from "@/utils";
import { useEffect, useState } from "react";

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
          notificationHelpers.errorAlert(respuesta.mensaje || "Error al cargar ítems");
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

  // Evita renderizar el modal si no está abierto
  if (!open) return null;

  return (
    <div className="modal fade show d-block shadowBackground" onClick={onHide}>
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
              columnKeys={[
                "iD_ItemOrdenServicio",
                "iD_OrdenServicio",
                "nombreItemOrdenServicio",
                "descripcion",
                "monto",
                "avance",
              ]}
              labelMap={{
                iD_ItemOrdenServicio: "ID Ítem",
                iD_OrdenServicio: "ID Orden",
                estado: "Estado",
                nombreItemOrdenServicio: "Nombre",
                descripcion: "Descripción",
                monto: "Monto",
                avance: "Avance",
              }}
              data={itemsOrdenes}
              onAdd={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onOpenItemsModal={() => {}}
              disableButtonAdd={false}
              customRenderers={{}}
              includeEstadoColumn
              modalInfoFields={[
                "iD_ItemOrdenServicio",
                "iD_OrdenServicio",
                "nombreItemOrdenServicio",
                "descripcion",
                "monto",
                "avance",
                "estado",
              ]}
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
