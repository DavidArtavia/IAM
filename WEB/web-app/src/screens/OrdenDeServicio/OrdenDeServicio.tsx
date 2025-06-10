import {
  BusinessButtons,
  ConfirmModal,
  FieldConfig,
  GenericDataTable,
  GenericFormModal,
} from "@/components";
import { DTO_Cliente, DTO_Negocio, DTO_OrdenServicio, DTO_Respuesta } from "@/models";
import { ordenesService } from "@/services";
import { errorHelpers, notificationHelpers, ordenServicioFormEditFields } from "@/utils";
import { useEffect, useMemo, useState } from "react";

export const OrdenDeServicio = () => {
  // Estado para manejar el negocio seleccionado
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
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


  const [clients, setClients] = useState<DTO_Cliente[]>([]);

  // 2.1. Carga lista de clientes al montar (o cuando cambie el negocio si es necesario)
  useEffect(() => {
    // Simulación de 5 clientes para pruebas
    setClients([
      {
      id_Cliente: 1,
      id_Usuario: 101,
      nombreCliente: "David",
      apellidoCliente: "aRTAVIA",
      telefonoCliente: "555-1111",
      correoCliente: "juan.perez@email.com",
      },
      {
      id_Cliente: 6,
      id_Usuario: 102,
      nombreCliente: "María",
      apellidoCliente: "Gómez",
      telefonoCliente: "555-2222",
      correoCliente: "maria.gomez@email.com",
      },
      {
      id_Cliente: 7,
      id_Usuario: 103,
      nombreCliente: "Carlos",
      apellidoCliente: "Ruiz",
      telefonoCliente: "555-3333",
      correoCliente: "carlos.ruiz@email.com",
      },
      {
      id_Cliente: 8,
      id_Usuario: 104,
      nombreCliente: "Ana",
      apellidoCliente: "Torres",
      telefonoCliente: "555-4444",
      correoCliente: "ana.torres@email.com",
      },
      {
      id_Cliente: 5,
      id_Usuario: 105,
      nombreCliente: "Luis",
      apellidoCliente: "Fernández",
      telefonoCliente: "555-5555",
      correoCliente: "luis.fernandez@email.com",
      },
    ]);
  }, []);

  // 3. Mapea a opciones para el select
  const clientOptions = useMemo(
    () =>
      clients.map((c) => ({
        value: c.id_Cliente, // ajusta según tu propiedad de ID
        label: c.nombreCliente + " " + c.apellidoCliente, // ajusta al campo de nombre
      })),
    [clients]
  );

  // 4. Construye el array de campos:
  //    agregamos un select de cliente **al final** de los campos base
  const formFields: FieldConfig<DTO_OrdenServicio>[] = useMemo(
    () => [
      ...ordenServicioFormEditFields,
      {
        key: "iD_Cliente",
        label: "Cliente",
        type: "select",
        options: clientOptions,
      },
    ],
    [clientOptions]
  );

  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setDisableButtonAdd(false);
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

  return (
    <div className="row p-4 col-12 gx-0">
      {/* Selección de negocio */}
      <BusinessButtons
        title="Negocios"
        handleSelectBusiness={handleSelectBusiness}
        selectedBusiness={selectedBusiness}
      />
      {/* Tabla GENÉRICA */}
      <GenericDataTable<DTO_OrdenServicio>
        title="Orden de Servicio"
        columnKeys={[]}
        labelMap={{}}
        data={[]}
        onAdd={handleAddNew}
        onEdit={() => {}}
        onDelete={() => {}}
        disableButtonAdd={disableButtonAdd}
        includeEstadoColumn={false}
        includeReferenceColumn={false}
        customRenderers={{}}
      />

      {/* Modal “Registrar” */}
      <GenericFormModal<DTO_OrdenServicio>
        title="Registrar Orden de Servicio"
        show={isModalFormOpen}
        onHide={handleCancelAdd}
        data={formData}
        setData={setFormData}
        onSubmit={handleSave}
        fields={formFields} // Aquí deberías definir los campos del formulario
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
