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
} from "@/utils";
import {
  ConfirmModal,
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
      setSelectedBusiness(state.negocio)
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

  // --------- Modal de Confirmación de Borrar / Cancelar -----------
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);
  const [accountToDelete, setAccountToDelete] = useState<DTO_Cuenta | null>(
    null
  );

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
    });
  };
  const handleCancelAdd = () => {
    setConfirmModalMessage("¿Estás seguro de que deseas cancelar el registro?");
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };

  // ======== “Editar” ========
  const handleEdit = (rowData: DTO_Cuenta) => {
    setRowEditSelected(rowData);
    setEditData({ ...rowData }); // Hacemos copia para evitar mutar el original
    setShowEditModal(true);
  };
  const handleSaveEdit = (updatedData: DTO_Cuenta) => {
    if (!rowEditSelected) return;
    updatedData.iD_Cuenta = rowEditSelected.iD_Cuenta;
    updatedData.iD_Negocio = selectedBusiness?.iD_Negocio || 0;
    // Si no cambió “estado”, lo conservamos
    if (!updatedData.estado && rowEditSelected.estado) {
      updatedData.estado = { ...rowEditSelected.estado };
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
          iD_Estado: STATUS_TBL.ACCOUNT_PAYABLE.DELETED,
        },
        iD_Negocio: selectedBusiness?.iD_Negocio || 0,
      };
      cuentasService.actualizarCuenta(updatedData).subscribe({
        next: () => {
          notificationHelpers.infoAlert("Cuenta eliminada correctamente");
          refetchAccounts();
        },
        error: (err) => errorHelpers.serverError(err),
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

  //#region 🧱 Campos personalizados y referencias dinámicas
  // const buildRefFields = (item: DTO_OrdenServicio) =>
  //   item.referenciaJSON?.map((r, idx) => ({
  //     key: generateSafeKey(r.nombre) as keyof DTO_OrdenServicio,
  //     label: r.nombre,
  //     type: "custom" as const,
  //     renderer: () => (
  //       <input
  //         className="form-control"
  //         value={item.referenciaJSON?.[idx].valor || ""}
  //         onChange={(e) => {
  //           const arr = [...(item.referenciaJSON || [])];
  //           arr[idx] = { nombre: r.nombre, valor: e.target.value };
  //           if (item === formData) {
  //             setFormData({ ...item, referenciaJSON: arr });
  //           } else {
  //             setEditData({ ...item, referenciaJSON: arr });
  //           }
  //         }}
  //       />
  //     ),
  //   })) || [];

  const newFormFields: FieldConfig<DTO_Cuenta>[] = [
    ...cuentasFormEditFields,
    {
      key: "monto",
      label: "Monto",
      type: "number",
      required: true,
    },
  ];

  // const editFormFields: FieldConfig<DTO_OrdenServicio>[] = [
  //   ...ordenServicioFormEditFields,
  //   {
  //     key: "iD_Cliente",
  //     label: "Cliente",
  //     type: "custom",
  //     required: true,
  //     renderer: ({ onChange }) => (
  //       <AsyncClientSelect
  //         value={selectedClientOption}
  //         onChange={(opt) => {
  //           setSelectedClientOption(opt);
  //           onChange(opt?.value || 0);
  //         }}
  //       />
  //     ),
  //   },
  //   {
  //     key: "estado",
  //     label: "Estado de la orden",
  //     type: "custom",
  //     required: true,
  //     renderer: ({ value, onChange }) => {
  //       const selectedOption = value?.iD_Estado
  //         ? { value: value.iD_Estado, label: value.nombre || "" }
  //         : null;
  //       return (
  //         <AsyncSelect
  //           cacheOptions
  //           defaultOptions={STATUS_ORDEN_SERVICIO_OPTIONS}
  //           placeholder="Seleccione un estado"
  //           value={selectedOption}
  //           onChange={(opt) =>
  //             onChange({ iD_Estado: opt?.value, nombre: opt?.label })
  //           }
  //           loadOptions={async (inputValue) =>
  //             STATUS_ORDEN_SERVICIO_OPTIONS.filter((opt) =>
  //               opt.label.toLowerCase().includes(inputValue.toLowerCase())
  //             )
  //           }
  //         />
  //       );
  //     },
  //   },
  //   ...buildRefFields(editData),
  // ];
 
  //#endregion 

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
          <ReferenciaCards items={row.detalleJSON || []} />
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
            data={accountsPayable}
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
          fields={newFormFields}
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
          fields={cuentasFormEditFields}
        />
      </div>
    </>
  );
};
