import { GenericDataTable } from "@/components/Tables/DataTable/GenericDataTable";
import { DTO_ItemOrdenServicio, DTO_Respuesta } from "@/models";
import { itemsOrdenesService } from "@/services";
import { errorHelpers, procesarRespuesta } from "@/utils";
import { useEffect, useState } from "react";

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
  // cargas iniciales de los ítems de la orden de servicio
  console.log(
    "Abriendo modal de ítems de orden de servicio con datos: ",
    rowData
  );
    // useEffect(() => {
    //   const itemsOrden = new DTO_ItemOrdenServicio();
    //   itemsOrden.ID_OrdenServicio = rowData.iD_OrdenServicio;
    //   console.log("Envio el item de orden de servicio: ", itemsOrden);

    //   itemsOrdenesService.obtenerItemsOrdensDeServicio(itemsOrden).subscribe({
    //     next: (result) => {
    //       console.log("Items de la orden de servicio: ", result);

    //       const respuesta = result as DTO_Respuesta;
    //       const items = Array.isArray(respuesta.resultado) ? respuesta.resultado as DTO_ItemOrdenServicio[] : [];
    //       setItemsOrdenes(procesarRespuesta(items) ?? []);
    //     },
    //     error: (err) => errorHelpers.serverError(err),
    //     complete: () => {},
    //   });
    // }, [rowData]);


  const [itemsOrdenes, setItemsOrdenes] = useState<
    Array<DTO_ItemOrdenServicio>
  >([]);
  if (!open) return null;

    console.log("Items de orden de servicio cargados: ", itemsOrdenes);
    
  return (
    <div className="modal fade show d-block shadowBackground" onClick={onHide}>
      <div
        className="modal-dialog modal-dialog-centered mw-1000px"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2>{title}</h2>
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-color-primary"
              onClick={onHide}
            >
              ✕
            </button>
          </div>
          <div className="modal-body py-10 px-lg-17">
            <GenericDataTable<DTO_ItemOrdenServicio>
              title="Ítems de la Orden de Servicio"
              columnKeys={[
                "ID_ItemOrdenServicio",
                "ID_OrdenServicio",
                "Estado",
                "NombreItemOrdenServicio",
                "Descripcion",
                "Monto",
                "Avance",
              ]}
              labelMap={{
                id_ItemOrdenServicio: "ID Ítem",
                id_OrdenServicio: "ID Orden",
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
              includeEstadoColumn={false}
              includeReferenceColumn={false}
              modalInfoFields={[]}
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
};
