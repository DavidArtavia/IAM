// src/pages/Cuentas.tsx
import { useEffect, useState } from "react";
import {
  DTO_Negocio,
  DTO_Respuesta,
  DTO_Cuenta,
  DTO_DetalleCuentaJSON,
} from "@/models";
import { cuentasService } from "@/services";
import {
  errorHelpers,
  notificationHelpers,
  procesarRespuesta,
  labelMapCuenta,
  cuentasFormEditFields,
  columnKeysCuenta,
  keysInfoModalCuenta,
  cuentasFormAddFields,
  formatColones,
  formatDetalleJSON,
} from "@/utils";
import {
  ConfirmModal,
  DetalleCuentaInput,
  FieldConfig,
  GenericDataTable,
  GenericFormModal,
  InfoModal,
  InfoPanel,
  LoadingPanel,
  TransaccionesPorCuentaModal,
} from "@/components";
import { STATUS_TBL } from "@/constants";
import { useApp } from "@/hooks/useApp";
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
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
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

  const [isTransaccionesModalOpen, setIsTransaccionesModalOpen] =
    useState(false);
  const [accountTransactions, setAccountTransactions] =
    useState<DTO_Cuenta | null>(null);
  //#endregion

  //#region ℹ️ info Modal estados;
  const [rowTableSelected, setRowTableSelected] = useState<DTO_Cuenta>();

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
       next: (result: any) => {
      const nueva = (result.resultado as DTO_Cuenta[])[0];
      // ✅ Filtramos si no es eliminado antes de agregar
      if (nueva.estado?.iD_Estado !== STATUS_TBL.ACCOUNT.DELETED) {
        setAccountsPayable((prev) => [nueva, ...prev]);
      }
      notificationHelpers.successAlert(result.mensaje || "Cuenta registrada correctamente");
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
    setConfirmModalMessage(
      `¿Estás seguro de que deseas eliminar la cuenta: ${rowData.iD_Cuenta}?`
    );
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
            setAccountsPayable((prev) =>
              prev.filter((c) => c.iD_Cuenta !== accountToDelete.iD_Cuenta)
            );
          } else {
            const mensaje = result.mensaje;
            notificationHelpers.successAlert(mensaje);
          }
        },
        complete: () => {
          setShowEditModal(false);
        },
      });
      setAccountToDelete(null);
    }
    setIsConfirmOpen(false);
  };
  //#endregion

  //#region 🔄 Obtener transacciones por cuenta

  const handleTransaction = (row: DTO_Cuenta) => {
  
    setAccountTransactions(row);
    setIsTransaccionesModalOpen(true);
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
        setIsInfoModalOpen(false);
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

  //#region custom column DetallesJson
  const detalleJSONColumn = {
    title: labelMap["detalleJSON"] ?? "Detalle",
    data: "detalleJSON",
    orderable: true,
    searchable: true,
    className: "text-center",
    defaultContent: "",
    render: function (_: unknown, type: "display" | "export" | "filter" | "sort", row: DTO_Cuenta) {
      return formatDetalleJSON(row?.detalleJSON ?? {}, type);
    },
  };
  //#endregion

  const formAddFields: FieldConfig<DTO_Cuenta>[] = [
    ...cuentasFormAddFields,
    {
      key: "detalleJSON",
      label: "Detalle",
      type: "custom",
      required: detalleHabilitado, // requerido solo si el switch está activado
      order: 6,
      errorMessage:
        "Tienes datos sin agregar. Presiona el botón ➕ antes de continuar.",

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
    ...cuentasFormEditFields,
    ...(rowTableSelected?.iD_OrdenServicio
      ? [
          {
            key: "iD_OrdenServicio",
            label: "Orden De Servicio #",
            type: "text",
            order: 4,
          } as FieldConfig<any>,
        ]
      : []),
    {
      key: "detalleJSON",
      label: "Detalle",
      type: "custom",
      required: detalleHabilitado,
      order: 10,
      errorMessage:
        "Tienes datos sin agregar. Presiona el botón ➕ antes de continuar.",
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
  //#region 🔑 Claves de información para el modal
  const infoModalFields: FieldConfig<any>[] = [
    ...(rowTableSelected?.iD_OrdenServicio
      ? [
          {
            key: "iD_OrdenServicio",
            label: "Orden De Servicio #",
            type: "text",
            order: 0,
          } as FieldConfig<any>,
        ]
      : []),
    ...keysInfoModalCuenta,
    {
      key: "detalleJSON",
      label: "Detalles",
      type: "custom",
      order: 6,
      renderer: ({ value }) => {
        if (!value) {
          return (
            <div className="text-muted fst-italic">
              <i className="bi bi-info-circle me-2"></i>
              Sin detalles registrados
            </div>
          );
        }

        const detalle = value as DTO_DetalleCuentaJSON;
        const filas = detalle.filas ?? [];

        return (
          <div className="d-flex flex-column gap-4">
            {/* Resumen de parámetros */}
            <div className="d-flex flex-wrap gap-4">
              <div className="bg-light border rounded px-4 py-3 d-flex flex-column shadow-sm">
                <span className="text-muted fw-semibold small">Descuento</span>
                <span className="fw-bold text-gray-800 fs-6">
                  {detalle.descuento?.nombre === "Monto"
                    ? `₡${Number(detalle.descuento?.valor ?? 0).toLocaleString(
                        "es-CR",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}`
                    : `${Number(detalle.descuento?.valor ?? 0).toLocaleString(
                        "es-CR"
                      )}%`}
                </span>
              </div>

              <div className="bg-light border rounded px-4 py-3 d-flex flex-column shadow-sm">
                <span className="text-muted fw-semibold small">Impuesto</span>
                <span className="fw-bold text-gray-800 fs-6">
                  {Number(detalle.impuesto?.valor ?? 0).toLocaleString("es-CR")}
                  %
                </span>
              </div>

              <div className="bg-light border rounded px-4 py-3 d-flex flex-column shadow-sm">
                <span className="text-muted fw-semibold small">Filas</span>
                <span className="fw-bold text-gray-800 fs-6">
                  {filas.length}
                </span>
              </div>
            </div>

            {/* Tabla de filas */}
            {filas.length > 0 && (
              <div className="table-responsive bg-white border rounded shadow-sm p-0">
                <table className="table table-borderless table-sm align-middle w-100 mb-0">
                  <thead className="bg-light text-muted text-uppercase fs-8 fw-bold">
                    <tr>
                      <th className="ps-4 w-60">Nombre</th>
                      <th className="text-end pe-4 w-40">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((fila, idx) => (
                      <tr key={idx} className="border-bottom border-gray-200">
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-light fw-bold text-dark fs-8 px-2 py-1 shadow-sm">
                              #{idx + 1}
                            </span>
                            <span className="fw-semibold text-gray-800 fs-6">
                              {fila.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="text-end pe-4">
                          <span className="fw-bold text-dark fs-6">
                            {formatColones(fila.valor)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "monto",
      label: "Monto (₡)",
      type: "custom",
      order: 9,
      renderer: ({ value }) => {
        const monto = Number(value || 0);

        return (
          <div className="border border-gray-200 rounded px-4 py-3 d-flex align-items-center justify-content-between shadow-sm">
            <i className="bi bi-cash-coin fs-4 text-gray-600 me-3"></i>
            <span className="fw-semibold fs-5 text-gray-800"></span>
            {formatColones(monto)}
          </div>
        );
      },
    },
  ];

  //#region Botones custom del header del modal
  const headerButtonsToInfo = [
    {
      titulo: "Ver Transacciones",
      onClick: () => {
        handleTransaction(rowTableSelected!);
        setIsTransaccionesModalOpen(true);
      },
      className: "btn btn-bg-light btn-active-color-primary",
    },
    {
      titulo: "Eliminar",
      onClick: () => {
        handleDelete(rowTableSelected!);
      },
      className: "btn btn-bg-light btn-active-color-danger",
    },
  ];
  const headerButtonsToEdit = [
    {
      titulo: "Ver Transacciones",
      onClick: () => {
        handleTransaction(editData!);
      },
      className: "btn btn-bg-light btn-active-color-primary",
    },
    {
      titulo: "Eliminar",
      onClick: () => {
        handleDelete(editData!);
      },
      className: "btn btn-bg-light btn-active-color-danger",
    },
  ];

  //#endregion
  
  //#endregion

  //#endregion

  //#endregion

  //#region 🧩 Renderizado
  return (
    <>
      {/* #region 🧾 Tabla de cuentas */}
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
        customColumns={[detalleJSONColumn]}
        onRowClick={(row) => {
          setRowTableSelected(row);
          setIsInfoModalOpen(true);
        }}
          />
        ) : (
          <InfoPanel msj="Por favor, selecciona un negocio para ver sus cuentas por pagar." />
        )}

        {/* #region ℹ️ Modal de información */}
        <InfoModal
          show={isInfoModalOpen}
          onHide={() => setRowTableSelected(undefined)}
          data={rowTableSelected!}
          fields={infoModalFields}
          headerButtons={headerButtonsToInfo}
        />
        {/* #endregion */}

        {/* #region ➕ Modal de agregar cuenta */}
        <GenericFormModal<DTO_Cuenta>
          title="Crear una Cuenta"
          show={isModalFormOpen}
          onHide={handleCancelAdd}
          data={formData}
          setData={setFormData}
          onSubmit={handleSave}
          fields={formAddFields}
        />
        {/* #endregion */}

        {/* #region ✏️ Modal de editar cuenta */}
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
          headerButtons={headerButtonsToEdit}
        />
        {/* #endregion */}

        {/* #region ❓ Modal de confirmación */}
        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={confirmModalAction}
        />
        {/* #endregion */}

        {/* #region 🔄 Modal de transacciones por cuenta */}
        <TransaccionesPorCuentaModal
          open={isTransaccionesModalOpen}
          onHide={() => setIsTransaccionesModalOpen(false)}
          cuenta={accountTransactions || new DTO_Cuenta()}
          negocioId={selectedBusiness?.iD_Negocio || 0}
        />
        {/* #endregion */}
      </div>
      {/* #endregion */}
    </>
  );
  //#endregion
};
