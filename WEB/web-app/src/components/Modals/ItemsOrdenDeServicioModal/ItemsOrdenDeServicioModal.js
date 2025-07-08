import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ✅ RP-06: ItemsOrdenDeServicioModal adaptado con manejo local sin refetch y estructura organizada
import { useEffect, useState } from "react";
import { GenericDataTable } from "@/components/Tables/DataTable/GenericDataTable";
import { LoadingPanel } from "@/components/Panel/LoadingPanel";
import { CustomRange } from "@/components/Range/CustomRange";
import { columnKeysItemsOrdenServicio, labelMapItemsOrdenServicio, keysInfoModalItemsOrdenServicio, ItemsOrdenServicioFormEditFields, notificationHelpers, errorHelpers, updateItemById, } from "@/utils";
import { itemsOrdenesService } from "@/services";
import { STATUS_TBL } from "@/constants";
import { DTO_ItemOrdenServicio } from "@/models";
import { ConfirmModal, GenericFormModal } from "@/components";
export const ItemsOrdenDeServicioModal = ({ open, onHide, title = "Detalle del Ítem", rowData, }) => {
    //#region 🔄 Estados generales
    const [itemsOrdenes, setItemsOrdenes] = useState([]);
    const [loading, setLoading] = useState(false);
    //#endregion
    //#region ➕ Registro
    const [isModalFormOpen, setIsModalFormOpen] = useState(false);
    const [formData, setFormData] = useState(new DTO_ItemOrdenServicio());
    //#endregion
    //#region ✏️ Edición
    const [showEditForm, setShowEditForm] = useState(false);
    const [editData, setEditData] = useState(new DTO_ItemOrdenServicio());
    //#endregion
    //#region 🗑 Eliminación
    const [itemOrderToDelete, setItemOrderToDelete] = useState(null);
    //#endregion
    //#region ✅ Confirmación
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmModalMessage, setConfirmModalMessage] = useState("");
    const [confirmContext, setConfirmContext] = useState(null);
    //#endregion
    //#region 🚀 Cargar ítems al abrir
    useEffect(() => {
        if (!open || !rowData?.iD_OrdenServicio)
            return;
        setLoading(true);
        const request = {
            iD_OrdenServicio: rowData.iD_OrdenServicio,
        };
        itemsOrdenesService.obtenerItemsOrdensDeServicio(request).subscribe({
            next: (result) => {
                if (!result.tipoRespuesta) {
                    notificationHelpers.errorAlert(result.mensaje || "Error al cargar ítems");
                    return;
                }
                const raw = result.resultado?.[0];
                const items = Array.isArray(raw)
                    ? raw
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
            next: (result) => {
                const nuevo = result.resultado[0];
                if (nuevo)
                    setItemsOrdenes((prev) => [...prev, nuevo]); // Agregar el nuevo ítem
                notificationHelpers.successAlert(result.mensaje);
                setIsModalFormOpen(false);
            },
            error: errorHelpers.serverError,
        });
    };
    //#endregion
    //#region ✏️ Guardar edición
    const handleEdit = (row) => {
        setEditData(row);
        setShowEditForm(true);
    };
    const handleSaveEdit = () => {
        if (!editData)
            return;
        itemsOrdenesService.actualizarItemsOrdensDeServicio(editData).subscribe({
            next: (result) => {
                setItemsOrdenes((prev) => updateItemById(prev, editData, "iD_ItemOrdenServicio"));
                notificationHelpers.successAlert(result.mensaje);
                setShowEditForm(false);
            },
            error: errorHelpers.serverError,
        });
    };
    //#endregion
    //#region 🗑 Eliminar
    const handleDelete = (item) => {
        setConfirmModalMessage(`¿Estás seguro de eliminar el ítem ${item.nombreItemOrdenServicio}?`);
        setItemOrderToDelete(item);
        setConfirmContext("delete");
        setIsConfirmOpen(true);
    };
    const handleConfirmDelete = (action) => {
        if (action && itemOrderToDelete) {
            const updated = {
                ...itemOrderToDelete,
                estado: {
                    ...itemOrderToDelete.estado,
                    iD_Estado: STATUS_TBL.ITEMS_ORDER_SERVICE.DELETED,
                },
            };
            setItemsOrdenes((prev) => updateItemById(prev, updated, "iD_ItemOrdenServicio"));
            itemsOrdenesService.actualizarItemsOrdensDeServicio(updated).subscribe({
                next: (result) => {
                    notificationHelpers.infoAlert(result?.tipoRespuesta
                        ? `Ítem #${updated.iD_ItemOrdenServicio} eliminado exitosamente`
                        : result?.mensaje || "No se pudo eliminar el ítem");
                },
                error: errorHelpers.serverError,
            });
            setItemOrderToDelete(null);
        }
        setIsConfirmOpen(false);
        setConfirmContext(null);
    };
    const getActiveItemsOrdenes = () => itemsOrdenes.filter((item) => item.estado?.iD_Estado !== STATUS_TBL.ITEMS_ORDER_SERVICE.DELETED);
    //#endregion
    //#region ✅ Confirmar cancelación
    const handleCancelAdd = () => {
        setConfirmModalMessage("¿Estás seguro de cancelar el registro?");
        setConfirmContext("cancelAdd");
        setIsConfirmOpen(true);
    };
    const confirmModalAcion = (action) => {
        if (action) {
            if (confirmContext === "cancelAdd") {
                setIsModalFormOpen(false);
                notificationHelpers.infoAlert("Nuevo ítem descartado correctamente");
            }
            else if (confirmContext === "delete") {
                handleConfirmDelete(true);
            }
        }
        setIsConfirmOpen(false);
        setConfirmContext(null);
    };
    //#endregion
    //#region 🧾 Formularios y renderizadores
    const registerFormFields = [
        ...ItemsOrdenServicioFormEditFields,
        {
            key: "avance",
            label: "Avance",
            type: "custom",
            renderer: () => (_jsx(CustomRange, { data: [formData.avance ?? 0], onChange: (value) => setFormData((prev) => ({ ...prev, avance: value })) })),
        },
    ];
    const editFormFields = [
        ...ItemsOrdenServicioFormEditFields,
        {
            key: "avance",
            label: "Avance",
            type: "custom",
            renderer: () => (_jsx(CustomRange, { data: [editData.avance ?? 0], onChange: (value) => setEditData((prev) => ({ ...prev, avance: value })) })),
        },
    ];
    const customRenderers = {
        monto: (val) => new Intl.NumberFormat("es-CR", {
            style: "currency",
            currency: "CRC",
        }).format(Number(val) || 0),
    };
    //#endregion
    if (!open)
        return null;
    //#region 🎨 Render
    return (_jsx("div", { className: "modal fade show d-block shadowClearBackground", onClick: onHide, children: _jsx("div", { className: "modal-dialog modal-dialog-centered", style: { maxWidth: "95vw", width: "1200px" }, onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "modal-content resizable-metronic-modal", children: [_jsxs("div", { className: "modal-header cursor-move", children: [_jsx("h2", { className: "fw-bold", children: title }), _jsx("button", { type: "button", className: "btn btn-sm btn-icon btn-active-color-primary", onClick: onHide, children: "\u2715" })] }), _jsxs("div", { className: "modal-body py-10 px-lg-17", children: [loading ? (_jsx(LoadingPanel, { msj: "Cargando Items de la \u00F3rden de servicio, por favor espere..." })) : (_jsx(GenericDataTable, { title: "\u00CDtems de la Orden de Servicio", columnKeys: columnKeysItemsOrdenServicio, labelMap: labelMapItemsOrdenServicio, 
                                // data={itemsOrdenes}
                                data: getActiveItemsOrdenes(), onAdd: handleAddNew, onEdit: handleEdit, onDelete: handleDelete, customRenderers: customRenderers, includeEstadoColumn: true, modalInfoFields: keysInfoModalItemsOrdenServicio })), _jsx(GenericFormModal, { title: "Registrar Item de Orden de Servicio", show: isModalFormOpen, onHide: handleCancelAdd, data: formData, setData: setFormData, onSubmit: handleSave, fields: registerFormFields }), _jsx(GenericFormModal, { title: "Editar Orden de Servicio", show: showEditForm, onHide: () => setShowEditForm(false), data: editData, setData: setEditData, onSubmit: handleSaveEdit, fields: editFormFields }), _jsx(ConfirmModal, { show: isConfirmOpen, confirmMessage: confirmModalMessage, onAction: confirmModalAcion })] }), _jsx("div", { className: "modal-footer flex-center", children: _jsx("button", { type: "button", className: "btn btn-primary", onClick: onHide, children: "Cerrar" }) })] }) }) }));
    //#endregion
};
