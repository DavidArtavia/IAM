// src/pages/Monitor.tsx
import React, { useEffect, useState } from "react";
import { DTO_Negocio, DTO_Respuesta, DTO_Cuenta } from "@/models";
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

export const Cuentas = () => {
  //🔄 Estado general
  const { state } = useApp();

  useEffect(() => {
    if (state.negocio) {
      setSelectedBusiness(state.negocio);
      handleSelectBusiness(state.negocio);
    }
  }, [state]);

  //#endregion

  // Estado de negocio seleccionado
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  // Arreglo con DTO_CuentasPorPagar
  const [accountsPayable, setAccountsPayable] = useState<DTO_Cuenta[]>([]);
  const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(true);

  // --------- Modales “Registrar” y “Editar” -----------
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
  // --------- Modal de Confirmación de Borrar / Cancelar -----------
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

  useEffect(() => {
    setMontoInput(
      formData.monto && formData.monto !== 0 ? String(formData.monto) : ""
    );
  }, [formData.monto]);

  // Cuando cambia el negocio, recargamos cuentas
  useEffect(() => {
    if (selectedBusiness) {
      refetchAccounts();
    }
  }, [selectedBusiness]);

  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setDisableButtonAdd(false);
  };

  // Refetch de Cuentas por Pagar
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

  // ======== “Registrar” ========
  const handleAddNew = () => {
    setFormData(new DTO_Cuenta());
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

  // ======== “Editar” ========
  const handleEdit = (rowData: DTO_Cuenta) => {

    setFormData(new DTO_Cuenta()); // Reiniciar formulario
    setRowEditSelected(rowData);
    setEditData({ ...rowData }); // Hacemos copia para evitar mutar el original
    // ✅ Activar el switch si ya viene detalle
    setDetalleHabilitado(!!rowData.detalleJSON);

    // ✅ Mostrar monto correcto
    setMontoInput(
      rowData.monto && rowData.monto !== 0 ? String(rowData.monto) : ""
    );
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedData: DTO_Cuenta) => {
     const parsed = parseFloat(montoInput.replace(/[^0-9.]/g, ""));
     updatedData.monto = isNaN(parsed) ? 0 : parsed;
    if (!rowEditSelected) return;
    updatedData.iD_Cuenta = rowEditSelected.iD_Cuenta;
    updatedData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
    // Si no cambió “estado”, lo conservamos
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

  // ======== “Eliminar” ========
  const handleDelete = (rowData: DTO_Cuenta) => {
    setConfirmModalMessage("¿Estás seguro de que deseas eliminar esta cuenta?");
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
        complete: () => {
          notificationHelpers.successAlert(
            "Cuenta eliminada correctamente"
          );
          refetchAccounts();
        }
      });
      
      setAccountToDelete(null);
    }
    setIsConfirmOpen(false);
  };

  // ======== Manejo de confirmación de “Cancelar registro” o “Eliminar”  ========
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

  //este renderizador personalizado formatea los valores de las columnas
  const customRenderers: {
    [K in keyof DTO_Cuenta]?: (
      value: unknown,
      rowData: DTO_Cuenta
    ) => string | number | React.ReactNode;
  } = {
    monto: (val: unknown) => {
      // formateo de números en colones
      return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 2,
      }).format(Number(val) || 0);
    },
    fechaInicial: (val: unknown) => {
      if (!val) return "";
      return new Date(String(val)).toLocaleDateString();
    },
    fechaLimite: (val: unknown) => {
      if (!val) return "";
      return new Date(String(val)).toLocaleDateString();
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
      required: !detalleHabilitado, // requerido solo si el switch está desactivado
      order: 7,
      renderer: () => {
        return (
          <div className="input-group">
            <span className="input-group-text">₡</span>
            <input
              type="text"
              className="form-control fw-bold fs-5 text-start"
              readOnly={detalleHabilitado}
              value={montoInput}
              onFocus={() => {
                if (formData.monto === 0) {
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
const formEditFields: FieldConfig<DTO_Cuenta>[] = [
  ...cuentasFormEditFields,
  {
    key: "detalleJSON",
    label: "Detalle",
    type: "custom",
    required: detalleHabilitado,
    order: 7,
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
    order: 8,
    renderer: () => (
      <div className="input-group">
        <span className="input-group-text">₡</span>
        <input
          type="text"
          className={`form-control fw-bold fs-5 text-start ${
            detalleHabilitado ? "bg-light" : ""
          }`}
          readOnly={detalleHabilitado}
          value={montoInput}
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
    ),
  },
];





  //#region 🧱 Columna personalizada para detalleJSON
  const detalleJSONColumn = {
    title: labelMap["detalleJSON"],
    data: null,
    orderable: true,
    searchable: true,
    defaultContent: "",
    render: function (_data: unknown, type: string, row: DTO_Cuenta) {
      const esExport =
        type === "export" || type === "filter" || type === "sort";

      if (esExport && Array.isArray(row.detalleJSON)) {
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
        ReactDOM.createRoot(container).render(
          <ReferenciaCards
            items={Array.isArray(row.detalleJSON) ? row.detalleJSON : []}// hay que cambiarlo xq se debe mostrar en forma de DTO_DetalleCuentaJSON
          />
        );
        htmlCell.appendChild(container);
      } catch (err) {
        console.warn("Error details JSON", err);
      }
    },
  };
  //#endregion

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
            includeEstadoColumn // añade automáticamente la columna “Estado”
            customRenderers={customRenderers}
            modalInfoFields={keysInfoModalCuenta}
            customColumns={[detalleJSONColumn]} // Añadimos la columna personalizada
            datekeys={["fechaInicial", "fechaModificacion", "fechaLimite"]} // claves de fecha para formatear en modal de información
          />
        ) : (
          <InfoPanel msj="Por favor, selecciona un negocio para ver sus cuentas por pagar." />
        )}

        {/* Modal “Registrar” */}
        <GenericFormModal<DTO_Cuenta>
          title="Crear una Cuenta"
          show={isModalFormOpen}
          onHide={handleCancelAdd}
          data={formData}
          setData={setFormData}
          onSubmit={handleSave}
          fields={formAddFields}
        />

        {/* Modal “Confirmación” */}
        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={confirmModalAction}
        />

        {/* Modal “Editar” */}
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
      </div>
    </>
  );
};
