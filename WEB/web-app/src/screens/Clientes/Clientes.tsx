import {
  ConfirmModal,
  GenericDataTable,
  GenericFormModal,
  LoadingPanel,
} from "@/components";
import { useEffect, useState } from "react";
import { DTO_Cliente, DTO_Respuesta } from "@/models";
import { clientesService } from "@/services";
import {
  clienteFormEditFields,
  columnKeysCliente,
  errorHelpers,
  keysInfoModalCliente,
  labelMapCliente,
  notificationHelpers,
  procesarRespuesta,
} from "@/utils";
import { STATUS_TBL } from "@/constants";

export const Clientes = () => {
  // --------------------------------------------------
  // 1. HOOKS Y ESTADOS
  // --------------------------------------------------

  const [clientes, setClientes] = useState<DTO_Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState<DTO_Cliente>(new DTO_Cliente());
  const [editData, setEditData] = useState<DTO_Cliente>(new DTO_Cliente());

  const [clienteToDelete, setClienteToDelete] = useState<DTO_Cliente | null>(
    null
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");

  // --------------------------------------------------
  // 2. EFECTO: CARGAR CLIENTES AL CAMBIAR NEGOCIO
  // --------------------------------------------------
  useEffect(() => {
    setLoading(true);
    clientesService.obtenerClientes().subscribe({
      next: (result) => {
        setClientes(
          (procesarRespuesta(
            result as unknown as DTO_Respuesta
          ) as DTO_Cliente[]) || []
        );
        handleNotification(result, "info");
      },
      error: (err) => errorHelpers.serverError(err),
      complete: () => {
        setLoading(false);
      },
    });
  }, []);

  const handleNotification = (result: any, typeNotification: string) => {
    if (result.resultado) {
      switch (typeNotification) {
        case "succes":
          notificationHelpers.successAlert(result.mensaje);
          break;
        case "info":
          notificationHelpers.infoAlert(result.mensaje);
          break;
        default:
          notificationHelpers.warningAlert(result.mensaje);
          break;
      }
    } else {
      notificationHelpers.errorAlert(
        result.mensaje || "Error al procesar la solicitud"
      );
    }
  };
  // --------------------------------------------------
  // 4. AGREGAR NUEVO CLIENTE
  // --------------------------------------------------
  const handleAddNew = () => {
    setFormData(new DTO_Cliente());
    setIsFormOpen(true);
  };

  const handleSave = () => {
    formData.Estado.iD_Estado = STATUS_TBL.CLIENT.ACTIVE;
    clientesService.registrarClientes(formData).subscribe({
      next: (res) => {
        const nuevoCliente = (
          Array.isArray(res.resultado) ? res.resultado[0] : res.resultado
        ) as DTO_Cliente;
        handleNotification(res, "succes");
        setIsFormOpen(false);
        // ✅ Refrescar tabla local
        setClientes((prev) => [nuevoCliente, ...prev]);
      },
      error: errorHelpers.serverError,
    });
  };

  const handleCancelAdd = () => {
    setIsFormOpen(false);
    notificationHelpers.infoAlert("Nuevo cliente descartado correctamente");
  };

  // --------------------------------------------------
  // 5. EDITAR CLIENTE
  // --------------------------------------------------
  const handleEdit = (cliente: DTO_Cliente) => {
    setEditData({ ...cliente });
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    const updated = { ...editData };

    clientesService.actualizarClientes(updated).subscribe({
      next: (res) => {
        handleNotification(res, "succes");
        setShowEditForm(false);
      },
      error: errorHelpers.serverError,
    });
    // ✅ Refrescar tabla local
    setClientes((prev) =>
      prev.map((c) => (c.iD_Cliente === updated.iD_Cliente ? updated : c))
    );
  };

  // --------------------------------------------------
  // 6. ELIMINAR (DESACTIVAR) CLIENTE
  // --------------------------------------------------
  const handleDelete = (cliente: DTO_Cliente) => {
    setClienteToDelete(cliente);
    setConfirmModalMessage(
      `¿Estás seguro de que deseas eliminar al cliente ${cliente.nombreCliente}?`
    );
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = (action: boolean | null) => {
      if (action && clienteToDelete) {
      const updated: DTO_Cliente = {
        ...clienteToDelete,
        estado: {
          ...clienteToDelete.estado!,
          iD_Estado: STATUS_TBL.CLIENT.DELETED,
        },
      };
      // ✅ Refrescar tabla local
      setClientes((prev) =>
        prev.map((c) => (c.iD_Cliente === updated.iD_Cliente ? updated : c))
      );

      clientesService.actualizarClientes(updated).subscribe({
        next: (res) => handleNotification(res, "info"),
        error: errorHelpers.serverError,
      });

      setClienteToDelete(null);
    }
    setIsConfirmOpen(false);
  };

  // --------------------------------------------------
  // 9. RENDER
  // --------------------------------------------------
  return (
    <div className="row p-4 gx-0">
      {loading ? (
        <LoadingPanel msj="Cargando clientes, por favor espere..." />
      ) : (
        clientes && (
          <GenericDataTable<DTO_Cliente>
            title="Clientes"
            columnKeys={columnKeysCliente}
            labelMap={labelMapCliente}
            data={clientes}
            onAdd={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
            includeEstadoColumn
            modalInfoFields={keysInfoModalCliente}
          />
        )
      )}

      {/* Modal: Registrar Cliente */}
      <GenericFormModal<DTO_Cliente>
        title="Registrar Cliente"
        show={isFormOpen}
        onHide={handleCancelAdd}
        data={formData}
        setData={setFormData}
        onSubmit={handleSave}
        fields={clienteFormEditFields}
      />

      {/* Modal: Editar Cliente */}
      <GenericFormModal<DTO_Cliente>
        title="Editar Cliente"
        show={showEditForm}
        onHide={() => setShowEditForm(false)}
        data={editData}
        setData={setEditData}
        onSubmit={handleSaveEdit}
        fields={clienteFormEditFields}
      />

      {/* Modal: Confirmar Eliminación */}
      <ConfirmModal
        show={isConfirmOpen}
        confirmMessage={confirmModalMessage}
        onAction={handleConfirmDelete}
      />
    </div>
  );
};
