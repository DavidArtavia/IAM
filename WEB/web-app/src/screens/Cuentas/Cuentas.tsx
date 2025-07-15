// src/pages/Cuentas.tsx
import { useEffect, useState } from "react";
import { DTO_Negocio, DTO_Respuesta, DTO_Cuenta, DTO_DetalleCuentaJSON } from "@/models";
import { cuentasService } from "@/services";
import {
  errorHelpers,
  notificationHelpers,
  procesarRespuesta,
  labelMapCuenta,
  cuentasFormEditFields,
  columnKeysCuenta,
  keysInfoModalCuenta,
  parametrosAString,
  cuentasFormAddFields,
} from "@/utils";
import {
  ConfirmModal,
  DetalleCuentaInput,
  FieldConfig,
  GenericDataTable,
  GenericFormModal,
  InfoPanel,
  LoadingPanel,
  ReferenciaCards,
} from "@/components";
import { STATUS_TBL } from "@/constants";
import { useApp } from "@/hooks/useApp";
import ReactDOM from "react-dom/client";
import { labelMapCuenta as labelMap } from "@/utils";

//#region 🔁 Estado Global y Negocio
export const Cuentas = () => {
  const { state } = useApp();

  useEffect(() => {
    if (state.negocio) {
      setSelectedBusiness(state.negocio);
      handleSelectBusiness(state.negocio);
    }
  }, [state]);

  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [accountsPayable, setAccountsPayable] = useState<DTO_Cuenta[]>([]);
  const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(true);
  //#endregion

  //#region 📦 Estados generales
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_Cuenta>(new DTO_Cuenta());
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<DTO_Cuenta | null>(null);
  const [rowEditSelected, setRowEditSelected] = useState<DTO_Cuenta | null>(
    null
  );
  const [detalleHabilitado, setDetalleHabilitado] = useState<boolean>(
    !!formData.detalleJSON
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  const [accountToDelete, setAccountToDelete] = useState<DTO_Cuenta | null>(
    null
  );
  const [montoInput, setMontoInput] = useState<string>(
    formData.monto && formData.monto !== 0 ? String(formData.monto) : ""
  );
  //#endregion

  //#region 🧮 Sincronización de montoInput y formData
  useEffect(() => {
    if (detalleHabilitado) return;
    if (formData.monto && formData.monto !== 0) {
      setMontoInput(String(formData.monto));
    } else {
      setMontoInput("");
    }
  }, [formData, detalleHabilitado]);

  useEffect(() => {
    setMontoInput(
      formData.monto && formData.monto !== 0 ? String(formData.monto) : ""
    );
  }, [formData.monto]);
  //#endregion

  //#region 🔁 Al cambiar de negocio, recargar cuentas
  useEffect(() => {
    if (selectedBusiness) {
      refetchAccounts();
    }
  }, [selectedBusiness]);

  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setDisableButtonAdd(false);
  };

  const refetchAccounts = () => {
    if (!selectedBusiness) return;
    setLoading(true);
    cuentasService.obtenerCuentas(selectedBusiness).subscribe({
      next: (result) =>
        setAccountsPayable(
          (procesarRespuesta(
            result as unknown as DTO_Respuesta
          ) as DTO_Cuenta[]) || []
        ),
      error: (err) => errorHelpers.serverError(err),
      complete: () => {
        setLoading(false);
      },
    });
  };
  //#endregion

  //#region ➕ Registrar
  const handleAddNew = () => {
    setDetalleHabilitado(false);
    setFormData(new DTO_Cuenta());
    setMontoInput("");
    setIsModalFormOpen(true);
  };

  const handleSave = () => {
    formData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
    const parsed = parseFloat(montoInput.replace(/[^0-9.]/g, ""));
    formData.monto = isNaN(parsed) ? 0 : parsed;
    cuentasService.registrarCuenta(formData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ||
          "Cuenta registrada correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
        setIsModalFormOpen(false);
      },
      error: (err) => errorHelpers.serverError(err),
      complete: () => {
        setDetalleHabilitado(false);
        setMontoInput("");
      },
    });
  };

  const handleCancelAdd = () => {
    setConfirmModalMessage("¿Estás seguro de que deseas cancelar el registro?");
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };
  //#endregion

  //#region ✏️ Editar
  const handleEdit = (rowData: DTO_Cuenta) => {
    setFormData(new DTO_Cuenta());
    setDetalleHabilitado(!!rowData.detalleJSON);
    setRowEditSelected(rowData);
    setEditData({ ...rowData });
    setMontoInput(String(rowData.monto || ""));
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedData: DTO_Cuenta) => {
    const parsed = parseFloat(montoInput.replace(/[^0-9.]/g, ""));
    updatedData.monto = isNaN(parsed) ? 0 : parsed;

    if (!rowEditSelected) return;
    updatedData.iD_Cuenta = rowEditSelected.iD_Cuenta;
    updatedData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;

    if (!updatedData.estado && rowEditSelected.estado) {
      updatedData.estado = { ...rowEditSelected.estado };
    }

    if (!detalleHabilitado) {
      const parsed = parseFloat(montoInput.replace(/[^0-9.]/g, ""));
      updatedData.monto = parsed;
    }

    cuentasService.actualizarCuenta(updatedData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ||
          "Cuenta actualizada correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
        setShowEditModal(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };
  //#endregion

  //#region 🗑 Eliminar
  const handleDelete = (rowData: DTO_Cuenta) => {    
    setConfirmModalMessage(`¿Estás seguro de que deseas eliminar la cuenta: ${rowData.iD_Cuenta}?`);
    setAccountToDelete(rowData);
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = (action: boolean | null) => {
    if (action && accountToDelete) {
      const updatedData: DTO_Cuenta = {
        ...accountToDelete,
        estado: {
          ...accountToDelete.estado!,
          iD_Estado: STATUS_TBL.ACCOUNT.DELETED,
        },
        iD_Negocio: selectedBusiness?.iD_Negocio || 0,
      };
      cuentasService.actualizarCuenta(updatedData).subscribe({
        error: (err) => errorHelpers.serverError(err),
        next: (result: DTO_Respuesta) => {
          if (result.codigo !== "B012") {
            notificationHelpers.successAlert("Cuenta eliminada correctamente");
          } else {
            const mensaje = result.mensaje;
            notificationHelpers.successAlert(mensaje);
          }
        },
        complete: () => {
          setShowEditModal(false);
          refetchAccounts();
        },
      });
      setAccountToDelete(null);
    }
    setIsConfirmOpen(false);
  };
  //#endregion

  //#region ❓ Confirmación Modal
  const confirmModalAction = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsModalFormOpen(false);
        notificationHelpers.infoAlert("Registro cancelado");
      } else if (confirmContext === "delete") {
        handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };
  //#endregion

  //#region 🔧 Renderizadores y configuración de campos personalizados
  const customRenderers = {
    monto: (val: unknown) =>
      new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 2,
      }).format(Number(val) || 0),
    fechaInicial: (val: unknown) =>
      val ? new Date(String(val)).toLocaleDateString() : "",
    fechaLimite: (val: unknown) =>
      val ? new Date(String(val)).toLocaleDateString() : "",
  };

  const detalleJSONColumn = {
    title: labelMap["detalleJSON"],
    data: null,
    orderable: true,
    searchable: true,
    defaultContent: "",
    render: function (_data: unknown, type: string, row: DTO_Cuenta) {
      if (
        (type === "export" || type === "filter" || type === "sort") &&
        Array.isArray(row.detalleJSON)
      ) {
        return parametrosAString(row.detalleJSON);
      }
      return "";
    },
    createdCell: (cell: Node, _data: unknown, row: DTO_Cuenta) => {
      try {
        const container = document.createElement("div");
        const htmlCell = cell as HTMLElement;
        htmlCell.innerHTML = "";
        container.classList.add("w-100");

        // Validar y extraer datos de detalleJSON
        const detalle = row.detalleJSON as DTO_DetalleCuentaJSON;

        const filas = detalle?.filas ?? [];
        const descuento = detalle?.descuento?.valor ?? "0";
        const impuesto = detalle?.impuesto?.valor ?? "0";

        ReactDOM.createRoot(container).render(
          <div className="mb-2">
            <div className="d-flex flex-wrap gap-2 mb-2"></div>
            <div className="d-flex flex-wrap gap-2">
              <div className="border rounded px-2 py-1 bg-success bg-opacity-10 text-success small shadow-sm">
                <strong>Descuento:</strong>
                {detalle.descuento.nombre === "Monto"
                  ? `₡${Number(descuento).toLocaleString("es-CR")}`
                  : `${Number(descuento).toLocaleString("es-CR")}%`}
              </div>
              <div className="border rounded px-2 py-1 bg-primary bg-opacity-10 text-primary small shadow-sm">
                <strong>Impuesto:</strong>{" "}
                {Number(impuesto).toLocaleString("es-CR")}%
              </div>
              <div className="border rounded px-2 py-1 bg-info bg-opacity-10 text-info small shadow-sm">
                <strong>Filas:</strong> {filas.length}
              </div>
            </div>
          </div>
        );
        htmlCell.appendChild(container);
      } catch (err) {
        console.warn("Error details JSON", err);
      }
    },
  };

  const formAddFields: FieldConfig<DTO_Cuenta>[] = [
    ...cuentasFormAddFields,
    {
      key: "detalleJSON",
      label: "Detalle",
      type: "custom",
      required: detalleHabilitado, // requerido solo si el switch está activado
      order: 6,
      renderer: ({ value, onChange }) => (
        <DetalleCuentaInput
          value={value}
          onChange={onChange}
          monto={formData.monto}
          setMonto={(val) => {
            setFormData({ ...formData, monto: val });
            setMontoInput(val !== 0 ? String(val) : "");
          }}
          onEnabledChange={(enabled) => setDetalleHabilitado(enabled)}
        />
      ),
    },
    {
      key: "monto",
      label: "Monto",
      type: "custom",
      required: !detalleHabilitado,
      order: 7,
      renderer: () => {
        return (
          <div className="input-group">
            <span className="input-group-text">₡</span>
            <input
              type="text"
              className="form-control fw-bold fs-5 text-start"
              readOnly={detalleHabilitado}
              value={montoInput} // ⬅️ CAMBIO AQUÍ
              onFocus={() => {
                if ((formData?.monto || 0) === 0 && montoInput === "0") {
                  setMontoInput("");
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setMontoInput(val);
                if (val === "") {
                  setFormData({ ...formData, monto: 0 });
                } else {
                  const num = parseFloat(val);
                  setFormData({ ...formData, monto: isNaN(num) ? 0 : num });
                }
              }}
              onBlur={(e) => {
                if (e.target.value === "" || isNaN(Number(e.target.value))) {
                  setMontoInput("");
                  setFormData({ ...formData, monto: 0 });
                }
              }}
              placeholder="₡0.00"
              min={0}
              step={0.01}
            />
          </div>
        );
      },
    },
  ];
  const formEditFields: FieldConfig<any>[] = [
    {
      key: "acciones",
      label: "Acciones",
      type: "custom",
      required: false,
      order: 1,
      renderer: () => {
        return (
          <div className="d-flex justify-content-star mb-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log("Se ejecuta transaciones");
              }}
              className="btn btn-primary me-2"
            >
              Transacciones
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDelete(editData!);
              }}
              className="btn btn-danger"
            >
              Eliminar
            </button>
          </div>
        );
      },
    },
    ...cuentasFormEditFields,
    {
      key: "detalleJSON",
      label: "Detalle",
      type: "custom",
      required: detalleHabilitado,
      order: 10,
      renderer: ({ value, onChange }) => (
        <DetalleCuentaInput
          value={value}
          onChange={onChange}
          monto={editData?.monto ?? 0}
          setMonto={(val) => {
            setMontoInput(val !== 0 ? String(val) : "");
            setEditData((prev) => (prev ? { ...prev, monto: val } : null)); // ✅ actualiza editData.monto
          }}
          onEnabledChange={(enabled) => setDetalleHabilitado(enabled)}
        />
      ),
    },
    {
      key: "monto",
      label: "Monto",
      type: "custom",
      required: !detalleHabilitado,
      order: 11,
      renderer: () => {
        return (
          <div className="input-group">
            <span className="input-group-text">₡</span>
            <input
              type="text"
              className={`form-control fw-bold fs-5 text-start ${
                detalleHabilitado ? "bg-light" : ""
              }`}
              readOnly={detalleHabilitado}
              value={
                montoInput !== ""
                  ? montoInput
                  : editData?.monto !== undefined && editData?.monto !== 0
                  ? String(editData.monto)
                  : ""
              }
              onFocus={() => {
                if ((editData?.monto || 0) === 0) {
                  setMontoInput("");
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setMontoInput(val);
                const num = parseFloat(val);
                setEditData((prev) =>
                  prev ? { ...prev, monto: isNaN(num) ? 0 : num } : null
                );
              }}
              onBlur={(e) => {
                const val = e.target.value;
                if (val === "" || isNaN(Number(val))) {
                  setMontoInput("");
                  setEditData((prev) => (prev ? { ...prev, monto: 0 } : null));
                }
              }}
              placeholder="₡0.00"
              min={0}
              step={0.01}
            />
          </div>
        );
      },
    },
  ];

  //#endregion

  //#region 🧩 Renderizado
  return (
    <>
      <div className="row p-4 col-12 gx-0">
        {state.negocio == null}
        {loading ? (
          <LoadingPanel msj="Cargando cuentas..." />
        ) : selectedBusiness ? (
          <GenericDataTable<DTO_Cuenta>
            title="Cuentas"
            columnKeys={columnKeysCuenta}
            labelMap={labelMapCuenta}
            data={accountsPayable.filter(
              (b) => b.estado?.iD_Estado !== STATUS_TBL.ACCOUNT.DELETED
            )}
            onAdd={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
            disableButtonAdd={disableButtonAdd}
            includeEstadoColumn
            customRenderers={customRenderers}
            modalInfoFields={keysInfoModalCuenta}
            customColumns={[detalleJSONColumn]}
            datekeys={["fechaInicial", "fechaModificacion", "fechaLimite"]}
          />
        ) : (
          <InfoPanel msj="Por favor, selecciona un negocio para ver sus cuentas por pagar." />
        )}

        <GenericFormModal<DTO_Cuenta>
          title="Crear una Cuenta"
          show={isModalFormOpen}
          onHide={handleCancelAdd}
          data={formData}
          setData={setFormData}
          onSubmit={handleSave}
          fields={formAddFields}
        />

        <GenericFormModal<DTO_Cuenta>
          title="Editar Cuenta"
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          data={editData!}
          setData={(x) => setEditData(x as DTO_Cuenta)}
          onSubmit={() => {
            if (editData) {
              handleSaveEdit(editData);
            }
          }}
          fields={formEditFields}
        />
        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={confirmModalAction}
        />
      </div>
    </>
  );
  //#endregion
};
