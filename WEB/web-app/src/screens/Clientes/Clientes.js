import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ConfirmModal, GenericDataTable, GenericFormModal, LoadingPanel, } from "@/components";
import { DTO_Cliente } from "@/models";
import { clientesService } from "@/services";
import { clienteFormEditFields, columnKeysCliente, errorHelpers, keysInfoModalCliente, labelMapCliente, notificationHelpers, procesarRespuesta, updateItemById, } from "@/utils";
import { STATUS_TBL } from "@/constants";
export const Clientes = () => {
    //#region 🔄 Estado general
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);
    //#endregion
    //#region ➕ Registrar
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState(new DTO_Cliente());
    //#endregion
    //#region ✏️ Editar
    const [showEditForm, setShowEditForm] = useState(false);
    const [editData, setEditData] = useState(new DTO_Cliente());
    //#endregion
    //#region 🗑 Eliminar
    const [clienteToDelete, setClienteToDelete] = useState(null);
    //#endregion
    //#region ✅ Confirmación
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmModalMessage, setConfirmModalMessage] = useState("");
    const [confirmContext, setConfirmContext] = useState(null);
    //#endregion
    //#region 🚀 Carga inicial
    useEffect(() => {
        setLoading(true);
        clientesService.obtenerClientes().subscribe({
            next: (result) => {
                const data = procesarRespuesta(result);
                setClientes(data || []);
                handleNotification(result, "info");
            },
            error: errorHelpers.serverError,
            complete: () => setLoading(false),
        });
    }, []);
    //#endregion
    //#region 🔔 Notificación
    const handleNotification = (result, type) => {
        if (result.resultado) {
            const msg = result.mensaje || "Operación realizada correctamente";
            if (type === "succes")
                notificationHelpers.successAlert(msg);
            else if (type === "info")
                notificationHelpers.infoAlert(msg);
            else
                notificationHelpers.warningAlert(msg);
        }
        else {
            notificationHelpers.errorAlert(result.mensaje || "Error al procesar la solicitud");
        }
    };
    //#endregion
    //#region 🧩 Registrar
    const handleAddNew = () => {
        setFormData(new DTO_Cliente());
        setIsFormOpen(true);
    };
    const handleSave = () => {
        formData.estado = {
            iD_Estado: STATUS_TBL.CLIENT.ACTIVE,
            nombre: "activo",
            tabla: "",
        };
        clientesService.registrarClientes(formData).subscribe({
            next: (res) => {
                const nuevo = (Array.isArray(res.resultado) ? res.resultado[0] : res.resultado);
                setClientes((prev) => [...prev, nuevo]);
                handleNotification(res, "succes");
                setIsFormOpen(false);
            },
            error: errorHelpers.serverError,
        });
    };
    const handleCancelAdd = () => {
        setConfirmModalMessage("¿Estás seguro de que deseas cancelar el registro?");
        setConfirmContext("cancelAdd");
        setIsConfirmOpen(true);
    };
    //#endregion
    //#region ✏️ Guardar Edición
    const handleEdit = (cliente) => {
        setEditData({ ...cliente });
        setShowEditForm(true);
    };
    const handleSaveEdit = () => {
        const updated = { ...editData };
        clientesService.actualizarClientes(updated).subscribe({
            next: (res) => {
                setClientes((prev) => updateItemById(prev, updated, "iD_Cliente"));
                handleNotification(res, "succes");
                setShowEditForm(false);
            },
            error: errorHelpers.serverError,
        });
    };
    //#endregion
    //#region 🗑 Confirmar Eliminación
    const handleDelete = (cliente) => {
        setConfirmModalMessage(`¿Estás seguro de que deseas eliminar al cliente ${cliente.nombreCliente}?`);
        setClienteToDelete(cliente);
        setConfirmContext("delete");
        setIsConfirmOpen(true);
    };
    const handleConfirmDelete = (action) => {
        if (action && clienteToDelete) {
            const updated = {
                ...clienteToDelete,
                estado: {
                    ...clienteToDelete.estado,
                    iD_Estado: STATUS_TBL.CLIENT.DELETED,
                },
            };
            setClientes((prev) => updateItemById(prev, updated, "iD_Cliente"));
            clientesService.actualizarClientes(updated).subscribe({
                next: (res) => handleNotification(res, "info"),
                error: errorHelpers.serverError,
            });
        }
        setClienteToDelete(null);
        setIsConfirmOpen(false);
        setConfirmContext(null);
    };
    //#endregion
    //#region 🎛️ Cancelar confirmaciones
    const confirmModalAction = (action) => {
        if (action) {
            if (confirmContext === "cancelAdd") {
                setIsFormOpen(false);
                notificationHelpers.infoAlert("Registro cancelado");
            }
            else if (confirmContext === "delete") {
                handleConfirmDelete(true);
            }
        }
        setIsConfirmOpen(false);
        setConfirmContext(null);
    };
    //#endregion
    //#region 🔍 Filtro para mostrar solo clientes activos
    const clientesActivos = clientes.filter((c) => c.estado?.iD_Estado !== STATUS_TBL.CLIENT.DELETED);
    //#endregion
    //#region 🎨 Render
    return (_jsxs("div", { className: "row p-4 gx-0", children: [loading ? (_jsx(LoadingPanel, { msj: "Cargando clientes, por favor espere..." })) : (_jsx(GenericDataTable, { title: "Clientes", columnKeys: columnKeysCliente, labelMap: labelMapCliente, data: clientesActivos, onAdd: handleAddNew, onEdit: handleEdit, onDelete: handleDelete, includeEstadoColumn: true, modalInfoFields: keysInfoModalCliente })), _jsx(GenericFormModal, { title: "Registrar Cliente", show: isFormOpen, onHide: handleCancelAdd, data: formData, setData: setFormData, onSubmit: handleSave, fields: clienteFormEditFields }), _jsx(GenericFormModal, { title: "Editar Cliente", show: showEditForm, onHide: () => setShowEditForm(false), data: editData, setData: setEditData, onSubmit: handleSaveEdit, fields: clienteFormEditFields }), _jsx(ConfirmModal, { show: isConfirmOpen, confirmMessage: confirmModalMessage, onAction: confirmModalAction })] }));
    //#endregion
};
