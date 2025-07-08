import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ✅ RP-19: Pantalla Transacciones adaptada a estructura definitiva (estado local, sin refetch completo, edición con lógica de cuentas)
import { useEffect, useState, useRef } from "react";
import { DTO_Transacciones } from "@/models";
import { ConfirmModal, GenericDataTable, GenericFormModal, InfoPanel, LoadingPanel, RestriccionModal, } from "@/components";
import { labelMapTransacciones, columnKeysTransacciones, transaccionesFormEditFields, keysInfoModalTransacciones, } from "@/utils";
import { errorHelpers, notificationHelpers, procesarRespuesta } from "@/utils";
import { STATUS_TBL } from "@/constants";
import { transaccionesService } from "@/services/transacciones.service";
import { useApp } from "@/hooks/useApp";
export const Transacciones = () => {
    //🔄 Estado general
    const { state } = useApp();
    useEffect(() => {
        if (state.negocio) {
            setSelectedBusiness(state.negocio);
            handleSelectBusiness(state.negocio);
        }
    }, [state]);
    //#endregion
    //#region 🔄 Estado y carga
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [disableButtonAdd, setDisableButtonAdd] = useState(true);
    //#endregion
    //#region ➕ Registro
    const [isModalFormOpen, setIsModalFormOpen] = useState(false);
    const [formData, setFormData] = useState(new DTO_Transacciones());
    //#endregion
    //#region ✏️ Edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [rowEditSelected, setRowEditSelected] = useState(null);
    //#endregion
    //#region 🗑 Confirmación
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmContext, setConfirmContext] = useState(null);
    const [confirmModalMessage, setConfirmModalMessage] = useState("");
    const [transToDelete, setTransToDelete] = useState(null);
    //#endregion
    //#region ⚠️ Modal restricción
    const [isModalRestriccionOpen, setIsModalRestriccionOpen] = useState(false);
    //#endregion
    //#region 📦 Efecto principal
    useEffect(() => {
        if (selectedBusiness)
            refetchTransacciones();
    }, [selectedBusiness]);
    const handleSelectBusiness = (negocio) => {
        setSelectedBusiness(negocio);
        setDisableButtonAdd(false);
    };
    const refetchTransacciones = () => {
        if (!selectedBusiness)
            return;
        setLoading(true);
        transaccionesService.obtenerTransaccion(selectedBusiness).subscribe({
            next: (result) => {
                const lista = procesarRespuesta(result);
                setTransacciones(lista.filter((t) => t.estado?.iD_Estado !== STATUS_TBL.TRANSACTION.DELETED));
            },
            error: errorHelpers.serverError,
            complete: () => setLoading(false),
        });
    };
    //#endregion
    //#region ✅ Crear
    const handleAddNew = () => {
        setFormData(new DTO_Transacciones());
        setIsModalFormOpen(true);
    };
    const handleSave = () => {
        formData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
        transaccionesService.registrarTransaccion(formData).subscribe({
            next: (result) => {
                const nueva = result.resultado[0];
                // ✅ Filtramos si no es eliminado antes de agregar
                if (nueva.estado?.iD_Estado !== STATUS_TBL.TRANSACTION.DELETED) {
                    setTransacciones((prev) => [nueva, ...prev]);
                }
                notificationHelpers.successAlert(result.mensaje);
                setIsModalFormOpen(false);
            },
            error: errorHelpers.serverError,
        });
    };
    const handleCancelAdd = () => {
        setConfirmModalMessage("¿Deseas cancelar el registro de la transacción?");
        setConfirmContext("cancelAdd");
        setIsConfirmOpen(true);
    };
    //#endregion
    //#region 🛠 Editar
    const handleEdit = (rowData) => {
        setRowEditSelected(rowData);
        setEditData({ ...rowData });
        setShowEditModal(true);
    };
    const handleSaveEdit = (updatedData) => {
        if (!rowEditSelected)
            return;
        updatedData.iD_Transaccion = rowEditSelected.iD_Transaccion;
        updatedData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
        if (!updatedData.estado?.iD_Estado && rowEditSelected.estado?.iD_Estado) {
            updatedData.estado = { ...rowEditSelected.estado };
        }
        transaccionesService.actualizarTransaccion(updatedData).subscribe({
            next: () => {
                // ✅ Si sigue activo, actualizar; si fue eliminado, eliminar de lista
                setTransacciones((prev) => updatedData.estado?.iD_Estado !== STATUS_TBL.TRANSACTION.DELETED
                    ? prev.map((t) => t.iD_Transaccion === updatedData.iD_Transaccion
                        ? updatedData
                        : t)
                    : prev.filter((t) => t.iD_Transaccion !== updatedData.iD_Transaccion));
                notificationHelpers.successAlert("Transacción actualizada correctamente");
                setShowEditModal(false);
            },
            error: errorHelpers.serverError,
        });
    };
    //#endregion
    //#region 🗑 Eliminar lógica
    const handleDelete = (rowData) => {
        setTransToDelete(rowData);
        setConfirmModalMessage("¿Deseas eliminar esta transacción?");
        setConfirmContext("delete");
        setIsConfirmOpen(true);
    };
    const handleConfirmDelete = (action) => {
        if (action && transToDelete) {
            const updated = {
                ...transToDelete,
                estado: {
                    ...transToDelete.estado,
                    iD_Estado: STATUS_TBL.TRANSACTION.DELETED,
                },
                iD_Negocio: selectedBusiness?.iD_Negocio || 0,
            };
            setTransacciones((prev) => prev.filter((t) => t.iD_Transaccion !== updated.iD_Transaccion));
            transaccionesService.actualizarTransaccion(updated).subscribe({
                next: () => notificationHelpers.infoAlert("Transacción eliminada"),
                error: errorHelpers.serverError,
            });
        }
        setIsConfirmOpen(false);
        setConfirmContext(null);
    };
    const confirmModalAction = (action) => {
        if (action) {
            if (confirmContext === "cancelAdd") {
                setIsModalFormOpen(false);
                notificationHelpers.infoAlert("Registro cancelado");
            }
            else if (confirmContext === "delete") {
                handleConfirmDelete(true);
            }
        }
        setIsConfirmOpen(false);
    };
    //#endregion
    //#region 🧾 Campos edición (cuenta bloqueada)
    const CuentaFieldRenderer = ({ field, editData, }) => {
        const infoIconRef = useRef(null);
        useEffect(() => {
            if (infoIconRef.current && window.bootstrap) {
                new window.bootstrap.Tooltip(infoIconRef.current);
            }
        }, []);
        return (_jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsx("input", { type: "text", className: "form-control form-control-solid null", value: String(editData?.[field.key] ?? ""), disabled: true }), _jsx("i", { ref: infoIconRef, className: "bi bi-info-circle-fill text-info", "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Esta es una transacci\u00F3n creada autom\u00E1ticamente desde una cuenta. Para modificarla, elim\u00EDnela y cr\u00E9ela manualmente." })] }));
    };
    const editFormFields = transaccionesFormEditFields.map((field) => {
        const esCuenta = editData?.tipoNumReferencia?.trim().toLowerCase() === "cuenta";
        if (esCuenta &&
            (field.key === "tipoNumReferencia" || field.key === "numReferencia")) {
            return {
                ...field,
                type: "custom",
                renderer: () => (_jsx(CuentaFieldRenderer, { field: field, editData: editData })),
            };
        }
        return field;
    });
    //#endregion
    //#region 🎨 Render
    return (_jsxs("div", { className: "row p-4 col-12 gx-0", children: [state.negocio == null, loading ? (_jsx(LoadingPanel, { msj: "Cargando transacciones..." })) : selectedBusiness ? (_jsx(GenericDataTable, { title: "Transacciones", columnKeys: columnKeysTransacciones, labelMap: labelMapTransacciones, data: transacciones, onAdd: handleAddNew, onEdit: handleEdit, onDelete: handleDelete, disableButtonAdd: disableButtonAdd, includeEstadoColumn: true, customRenderers: {
                    monto: (val) => new Intl.NumberFormat("es-CR", {
                        style: "currency",
                        currency: "CRC",
                        minimumFractionDigits: 2,
                    }).format(Number(val) || 0),
                    fechaTransaccion: (val) => val ? new Date(String(val)).toLocaleDateString() : "",
                }, modalInfoFields: keysInfoModalTransacciones, datekeys: ["fechaTransaccion"] })) : (_jsx(InfoPanel, { msj: "Selecciona un negocio para ver sus transacciones." })), _jsx(GenericFormModal, { title: "Registrar Transacci\u00F3n", show: isModalFormOpen, onHide: handleCancelAdd, data: formData, setData: setFormData, onSubmit: handleSave, fields: transaccionesFormEditFields }), _jsx(GenericFormModal, { title: "Editar Transacci\u00F3n", show: showEditModal, onHide: () => setShowEditModal(false), data: editData, setData: (x) => setEditData(x), onSubmit: () => editData && handleSaveEdit(editData), fields: editFormFields }), _jsx(ConfirmModal, { show: isConfirmOpen, confirmMessage: confirmModalMessage, onAction: confirmModalAction }), _jsx(RestriccionModal, { modalTitle: "Acci\u00F3n no permitida", modalTexto: "No tienes permisos para modificar esta transacci\u00F3n porque fue creada autom\u00E1ticamente desde el m\u00F3dulo de cuentas. Si deseas cambiar algo, primero debes eliminarla y luego crear una nueva transacci\u00F3n con los cambios deseados.", show: isModalRestriccionOpen, onClose: () => setIsModalRestriccionOpen(false) })] }));
    //#endregion
};
