import {
  AsyncClientSelect,
  BusinessButtons,
  ClientOption,
  ConfirmModal,
  FieldConfig,
  GenericDataTable,
  GenericFormModal,
} from "@/components";
import { DTO_CuentasPorPagar, DTO_Negocio, DTO_OrdenServicio, DTO_Respuesta } from "@/models";
import {ordenesService } from "@/services";
import { columnKeysOrdenDeServicio, errorHelpers, labelMapOrdenDeServicio, notificationHelpers, ordenServicioFormEditFields, procesarRespuesta } from "@/utils";
import { useEffect, useState } from "react";

export const OrdenDeServicio = () => {
  // Estado para manejar el negocio seleccionado
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [ordenDeServicio, setOrdenDeServicio] = useState<Array<DTO_OrdenServicio>>(
    []
  );
  
  const [loading, setLoading] = useState(false);

  const [selectedClientOption, setSelectedClientOption] = useState<ClientOption | null>(null);
  // --------- Modal de Confirmación de Borrar / Cancelar -----------
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(true);

  // --------- Modales “Registrar” y “Editar” -----------
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_OrdenServicio>(
    new DTO_OrdenServicio()
  );

    useEffect(() => {
      if (selectedBusiness) {
        refetchOrders();
      }
    }, [selectedBusiness]);

// Construye el array de campos del formulario para la orden de servicio:
  //    agregamos un select de cliente **al final** de los campos base
  const formFields: FieldConfig<DTO_OrdenServicio>[] = [
    ...ordenServicioFormEditFields,
    {
      key: "iD_Cliente",
      label: "Cliente",
      type: "custom",
      renderer: ({ onChange }) => (
        <AsyncClientSelect
          value={selectedClientOption}
          onChange={(opt) => {
            // 1) guardamos la opción completa para que la veas en el input
            setSelectedClientOption(opt);
            // 2) y actualizamos el formData con el id
            onChange(opt ? opt.value : 0);
          }}
        />
      ),
    },
  ];

  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setDisableButtonAdd(false);
    console.log("Negocio seleccionado:", negocio);
    
    refetchOrders();
  };

    // === Refetch O obtener Negocios ===
  const refetchOrders = () => {      
    setLoading(true);
    if (!selectedBusiness) return;
    ordenesService.obtenerOrdensDeServicio(selectedBusiness).subscribe({
        next: (result) => {
          console.log("Resultado de obtenerOrdensDeServicio:", result);
            // Extraer solo el array de órdenes de servicio desde la respuesta
            const respuesta = result as { resultado?: Array<DTO_OrdenServicio> };
            setOrdenDeServicio(respuesta.resultado || []);
        },
        error: (err) => errorHelpers.serverError(err),
      complete: () => {
        setLoading(false);
        },
      });
  };
  
  
  // ======== “Registrar” ========
  const handleAddNew = () => {
    setFormData(new DTO_OrdenServicio());
    setIsModalFormOpen(true);
  };
  const handleSave = () => {

    formData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
    formData.referenciaJSON = selectedBusiness?.referenciaJSON ?? [];
    ordenesService.registrarOrdensDeServicio(formData).subscribe({
      next: (result: unknown) => {
        const mensaje =
        (result as DTO_Respuesta)?.mensaje ||
        "Orden registrada correctamente";
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
  const confirmModalAction = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsModalFormOpen(false);
        notificationHelpers.infoAlert("Registro cancelado");
      } else if (confirmContext === "delete") {
        // handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };

  const customRenderers: {
    [K in keyof DTO_OrdenServicio]?: (
      value: unknown,
      rowData: DTO_OrdenServicio
    ) => string | number | React.ReactNode;
  } = {
    fechaOrdenServicio: (val: unknown) => {
      if (!val) return "";
      return new Date(String(val)).toLocaleDateString();
    },
    fechaEstimadaEntrega: (val: unknown) => {
      if (!val) return "";
      return new Date(String(val)).toLocaleDateString();
    },
  };

  return (
    <div className="row p-4 col-12 gx-0">
      {/* Selección de negocio */}
      <BusinessButtons
        title="Seleccione un negocio para gestionar órdenes de servicio:"
        handleSelectBusiness={handleSelectBusiness}
        selectedBusiness={selectedBusiness}
      />
      {/* Tabla GENÉRICA */}
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: 200 }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="ms-3 fs-5 text-primary">
            Cargando órdenes de servicio...
          </span>
        </div>
      ) : (
        <GenericDataTable<DTO_OrdenServicio>
          title="Orden de Servicio"
          columnKeys={columnKeysOrdenDeServicio}
          labelMap={labelMapOrdenDeServicio}
          data={ordenDeServicio}
          onAdd={handleAddNew}
          onEdit={() => {}}
          onDelete={() => {}}
          disableButtonAdd={disableButtonAdd}
          includeEstadoColumn={true} // añade automáticamente la columna “Estado”
          includeReferenceColumn={true}
          customRenderers={customRenderers}
        />
      )}
      {/* Modal “Registrar” */}
      <GenericFormModal<DTO_OrdenServicio>
        title="Registrar Orden de Servicio"
        show={isModalFormOpen}
        onHide={handleCancelAdd}
        data={formData}
        setData={setFormData}
        onSubmit={handleSave}
        fields={formFields}
      />

      {/* Modal “Confirmación” */}
      <ConfirmModal
        show={isConfirmOpen}
        confirmMessage={confirmModalMessage}
        onAction={confirmModalAction}
      />
    </div>
  );
};
