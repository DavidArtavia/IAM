import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ✅ RP-14: Pantalla Negocio adaptada a estructura definitiva (estado local, sin refetch, confirmación, referencias y filtros)
import { ConfirmModal, GenericDataTable, GenericFormModal, ReferenciasJsonInput, } from "@/components";
import { FILTER_STATUS, STATUS_TBL } from "@/constants";
import { AuthContext } from "@/context";
import { useApp } from "@/hooks/useApp";
import { DTO_Negocio } from "@/models";
import { negocioService } from "@/services";
import { keysInfoModalNegocio, columnKeysNegocio, errorHelpers, labelMapNegocio, negocioFormEditFields, notificationHelpers, procesarRespuesta, updateItemById, } from "@/utils";
import { useContext, useEffect, useState } from "react";
export const Negocio = () => {
    //#region 🔄 Estado y contexto
    const { state, setListaNegocios, setNegocio } = useApp();
    const { user } = useContext(AuthContext);
    const [business, setBusiness] = useState([]);
    const [disableButtonAdd] = useState(false);
    const [filtroEstado] = useState({
        filtroEstado: FILTER_STATUS.ACTIVO,
    });
    //#endregion
    //#region ➕ Registro
    const [isModalFormOpen, setIsModalFormOpen] = useState(false);
    const [formData, setFormData] = useState(new DTO_Negocio());
    //#endregion
    //#region ✏️ Edición
    const [showModalUpdateBusiness, setShowModalUpdateBusiness] = useState(false);
    const [editData, setEditData] = useState(null);
    const [rowBusinessSelected, setRowBusinessSelected] = useState(null);
    //#endregion
    //#region 🗑 Eliminación lógica
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmModalMessage, setConfirmModalMessage] = useState("");
    const [confirmContext, setConfirmContext] = useState(null);
    const [businessToDelete, setBusinessToDelete] = useState(null);
    //#endregion
    //#region 🚀 Obtener negocios al iniciar
    useEffect(() => {
        negocioService.obtenerNegocios(filtroEstado).subscribe({
            next: (result) => {
                const negocios = procesarRespuesta(result);
                setBusiness(negocios);
            },
            error: errorHelpers.serverError,
        });
    }, [filtroEstado]);
    //#endregion
    //#region ✅ Registrar negocio
    const handleAddNewBusiness = () => {
        setFormData(new DTO_Negocio());
        setIsModalFormOpen(true);
    };
    const handleSave = () => {
        formData.iD_Usuario = user?.iD_Usuario || 0;
        formData.estado = {
            iD_Estado: STATUS_TBL.BUSINESS.ACTIVE,
            nombre: "activo",
            tabla: "",
        };
        negocioService.registrarNegocio(formData).subscribe({
            next: (result) => {
                const nuevo = result.resultado[0];
                if (nuevo)
                    setBusiness((prev) => [...prev, nuevo]);
                {
                    notificationHelpers.successAlert(result.mensaje);
                    setListaNegocios([...state.listaNegocios, nuevo]);
                    //Seleccionarlo por defecto globalmente
                }
                setNegocio(nuevo);
                setIsModalFormOpen(false);
            },
            error: errorHelpers.serverError,
        });
    };
    //#endregion
    //#region ✏️ Guardar edición
    const handleEdit = (rowData) => {
        setRowBusinessSelected(rowData);
        setEditData({ ...rowData });
        setShowModalUpdateBusiness(true);
    };
    const handleSaveBusiness = (updatedData) => {
        if (!rowBusinessSelected)
            return;
        updatedData.iD_Negocio = rowBusinessSelected.iD_Negocio;
        updatedData.iD_Usuario = user?.iD_Usuario || 0;
        if (!updatedData.estado && rowBusinessSelected.estado) {
            updatedData.estado = { ...rowBusinessSelected.estado };
        }
        negocioService.actualizarNegocio(updatedData).subscribe({
            next: (result) => {
                setBusiness((prev) => updateItemById(prev, updatedData, "iD_Negocio"));
                notificationHelpers.successAlert(result.mensaje);
                setShowModalUpdateBusiness(false);
            },
            error: errorHelpers.serverError,
        });
    };
    //#endregion
    //#region 🗑 Confirmar eliminación
    const handleDelete = (rowData) => {
        setConfirmModalMessage(`¿Estás seguro de que deseas eliminar el negocio ${rowData.nombreNegocio}?`);
        setBusinessToDelete(rowData);
        setConfirmContext("delete");
        setIsConfirmOpen(true);
    };
    const handleConfirmDelete = (action) => {
        if (action && businessToDelete) {
            const updatedData = {
                ...businessToDelete,
                estado: {
                    ...businessToDelete.estado,
                    iD_Estado: STATUS_TBL.BUSINESS.DELETED,
                    nombre: "eliminado",
                },
            };
            setBusiness((prev) => updateItemById(prev, updatedData, "iD_Negocio"));
            negocioService.actualizarNegocio(updatedData).subscribe({
                next: (result) => {
                    notificationHelpers.infoAlert(result?.mensaje);
                    if (result.tipoRespuesta && businessToDelete) {
                        const nuevaLista = state.listaNegocios.filter(n => n.iD_Negocio !== businessToDelete.iD_Negocio);
                        setListaNegocios(nuevaLista);
                        if (state.negocio?.iD_Negocio === businessToDelete.iD_Negocio) {
                            setNegocio(state.listaNegocios.length > 1
                                ? state.listaNegocios.find(n => n.iD_Negocio !== businessToDelete.iD_Negocio) ?? null
                                : null);
                        }
                    }
                },
                error: errorHelpers.serverError,
            });
        }
        setBusinessToDelete(null);
        setIsConfirmOpen(false);
        setConfirmContext(null);
    };
    //#endregion
    //#region ❌ Cancelar
    const handleCancel = () => {
        setConfirmModalMessage("¿Estás seguro de que deseas cancelar?");
        setConfirmContext("cancelAdd");
        setIsConfirmOpen(true);
    };
    const confirmModalAcion = (action) => {
        if (action) {
            if (confirmContext === "cancelAdd") {
                setIsModalFormOpen(false);
                notificationHelpers.infoAlert("Cambios descartados correctamente");
            }
            else if (confirmContext === "delete") {
                handleConfirmDelete(true);
            }
        }
        setIsConfirmOpen(false);
        setConfirmContext(null);
    };
    //#endregion
    //#region 🧾 Campos formularios
    const newFormFields = [
        ...negocioFormEditFields,
        {
            key: "referenciaJSON",
            label: "Referencias",
            type: "custom",
            renderer: () => (_jsx(ReferenciasJsonInput, { value: formData.referenciaJSON, onChange: (val) => setFormData((prev) => ({ ...prev, referenciaJSON: val })) })),
            validate: (val) => {
                if (!Array.isArray(val) || val.length === 0)
                    return "";
                for (const ref of val) {
                    if (!ref.nombre)
                        return "Todos los campos deben estar completos.";
                }
                return "";
            },
        },
    ];
    const editFormFields = [
        ...negocioFormEditFields,
        {
            key: "referenciaJSON",
            label: "Referencias",
            type: "custom",
            renderer: () => (_jsx(ReferenciasJsonInput, { hideCheckbox: true, editable: false, value: editData?.referenciaJSON || [], onChange: (val) => setEditData((prev) => prev ? { ...prev, referenciaJSON: val } : null) })),
            validate: (val) => {
                if (!Array.isArray(val) || val.length === 0)
                    return "";
                for (const ref of val) {
                    if (!ref.nombre)
                        return "Todos los campos deben estar completos.";
                }
                return "";
            },
        },
    ];
    //#endregion
    //#region 🎨 Render
    return (_jsxs("div", { className: "row p-4 col-12 gx-0", children: [_jsx(GenericDataTable, { title: "Negocios", columnKeys: columnKeysNegocio, labelMap: labelMapNegocio, data: business.filter((b) => b.estado?.iD_Estado !== STATUS_TBL.BUSINESS.DELETED), onAdd: handleAddNewBusiness, onEdit: handleEdit, onDelete: handleDelete, disableButtonAdd: disableButtonAdd, includeEstadoColumn: true, includeReferenceColumn: true, customRenderers: {
                    fechaRegistro: (val) => val ? new Date(String(val)).toLocaleDateString() : "",
                }, modalInfoFields: keysInfoModalNegocio, datekeys: ["fechaRegistro"] }), _jsx(GenericFormModal, { title: "Registrar Negocio", show: isModalFormOpen, onHide: handleCancel, data: formData, setData: setFormData, onSubmit: handleSave, fields: newFormFields }), _jsx(GenericFormModal, { title: "Editar datos del Negocio", show: showModalUpdateBusiness, onHide: () => setShowModalUpdateBusiness(false), data: editData, setData: (x) => setEditData(x), onSubmit: () => editData && handleSaveBusiness(editData), fields: editFormFields }), _jsx(ConfirmModal, { show: isConfirmOpen, confirmMessage: confirmModalMessage, onAction: confirmModalAcion })] }));
    //#endregion
};
