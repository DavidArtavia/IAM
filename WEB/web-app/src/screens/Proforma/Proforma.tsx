// src/pages/Proformas.tsx
import {
  ConfirmModal,
  FieldConfig,
  GenericDataTable,
  GenericDataTableHandle,
  GenericFormModal,
  InfoModal,
  LoadingPanel,
  ProformaCrearModal,
} from "@/components";
import { STATUS_TBL } from "@/constants";
import { useApp } from "@/hooks/useApp";
import { DTO_Param, DTO_Respuesta, DTO_Proforma } from "@/models";
import { proformaService } from "@/services/proformas.service";
import {
  columnKeysProforma,
  errorHelpers,
  labelMapProforma,
  notificationHelpers,
  procesarRespuesta,
  formatColones,
} from "@/utils";
import { valida_DTO_Proformas } from "@/validators/valida_DTO_Proformas";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { catchError, finalize, map, of } from "rxjs";

export const Proformas = () => {
  const { state } = useApp();
  const tableRef = useRef<GenericDataTableHandle<DTO_Proforma>>(null);

  //#region 🛡️ Validaciones
  const [erroresValidacion, setErroresValidacion] = useState<DTO_Param[]>([]);
  let validacion: DTO_Param[];
  const eliminarError = (campo: string) => {
    setErroresValidacion((prev) => prev.filter((e) => e.nombre !== campo));
  };
  //#endregion

  //#region 🔄 Estado General
  const [loading, setLoading] = useState(false);
  const [proformas, setProformas] = useState<DTO_Proforma[]>([]);
  //#endregion

  //#region ℹ️ InfoModal
  const [rowTableSelected, setRowTableSelected] = useState<DTO_Proforma>();
  //#endregion

  //#region ➕ Registrar
  const [isRegisterFormOpen, setIsRegisterFormOpen] = useState(false);
  const [registerFormData, setRegisterFormData] = useState<DTO_Proforma>(
    new DTO_Proforma()
  );
  const [showCrearProforma, setShowCrearProforma] = useState(false);
  //#endregion

  //#region ✏️ Editar
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<DTO_Proforma>(new DTO_Proforma());
  //#endregion

  //#region 🗑 Eliminar
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState<string>("");
  const [proformaToDelete, setProformaToDelete] = useState<DTO_Proforma | null>(
    null
  );
  const [confirmContext, setConfirmContext] = useState<string | null>(null);
  //#endregion

  //#region 🚀 Carga inicial
  useEffect(() => {
    setLoading(true);
    if (state.negocio?.iD_Negocio) {
      const proformaWithBusiness = {
        ...new DTO_Proforma(),
        iD_Negocio: state.negocio.iD_Negocio,
      };

      const sub = proformaService
        .obtenerProformas(proformaWithBusiness)
        .pipe(
          map(
            (res) => procesarRespuesta(res as DTO_Respuesta) as DTO_Proforma[]
          ),
          catchError((err) => {
            errorHelpers.serverError(err);
            return of([] as DTO_Proforma[]);
          }),
          finalize(() => setLoading(false))
        )
        .subscribe(setProformas);

      return () => sub.unsubscribe();
    } else {
      setLoading(false);
    }
  }, [state.negocio]);
  //#endregion

  //#region 🧠 CRUD Logic

  //#region 🧩 Registrar
  const handleAddNew = () => {
    // setRegisterFormData(new DTO_Proforma());
    // setIsRegisterFormOpen(true);
    setShowCrearProforma(true);
  };

  const handleSave = () => {
    if (!state.negocio?.iD_Negocio) {
      notificationHelpers.warningAlert(
        "No se puede registrar: negocio inválido."
      );
      return;
    }
    const dataToRegister = {
      ...registerFormData,
      iD_Negocio: state.negocio.iD_Negocio,
      estado: {
        iD_Estado: STATUS_TBL.PROFORMA.DRAFT,
        nombre: "Borrador",
        tabla: "",
      },
    };

    validacion = valida_DTO_Proformas.validar(dataToRegister, "C");
    setErroresValidacion(validacion);

    if (validacion.length === 0) {
      proformaService.registrarProformas(dataToRegister).subscribe({
        next: (res: DTO_Respuesta) => {
          const nuevo = (
            Array.isArray(res.resultado) ? res.resultado[0] : res.resultado
          ) as DTO_Proforma;
          setProformas((prev) => [...prev, nuevo]);
          tableRef.current?.upsert(nuevo);
          notificationHelpers.successAlert(
            res.mensaje || "Proforma registrada correctamente"
          );
          setIsRegisterFormOpen(false);
        },
        error: errorHelpers.serverError,
      });
    } else {
      notificationHelpers.warningAlert(
        "Por favor valida los datos ingresados."
      );
    }
  };

  const handleCancelAdd = () => {
    setConfirmModalMessage("¿Deseas cancelar el registro?");
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };
  //#endregion
  
  const handleEdit = (proforma: DTO_Proforma) => {
    console.log("Editando proforma:", proforma);
    
    setEditData(proforma);
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    const updated = { ...editData };

    validacion = valida_DTO_Proformas.validar(updated, "U");
    setErroresValidacion(validacion);

    if (validacion.length === 0) {
      proformaService.actualizarProformas(updated).subscribe({
        next: (res: DTO_Respuesta) => {
          setProformas((prev) => updateItemById(prev, updated, "iD_Proforma"));
          notificationHelpers.infoAlert(res.mensaje);
          setShowEditForm(false);
        },
        error: errorHelpers.serverError,
      });
    } else {
      notificationHelpers.warningAlert(
        "Por favor valida los datos ingresados."
      );
    }
  };

  const updateItemById = <T,>(arr: T[], updatedItem: T, idKey: keyof T): T[] =>
    arr.map((item) =>
      item[idKey] === updatedItem[idKey] ? updatedItem : item
    );

  const handleDelete = (proforma: DTO_Proforma) => {
    setConfirmModalMessage(
      `¿Estás seguro de que deseas eliminar la proforma #${proforma.iD_Proforma}?`
    );
    setProformaToDelete(proforma);
    setConfirmContext("delete");
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = (action: boolean | null) => {
    if (!action || !proformaToDelete) {
      setProformaToDelete(null);
      setIsConfirmOpen(false);
      setConfirmContext(null);
      return;
    }
    tableRef.current?.removeById(proformaToDelete.iD_Proforma);
    const updated: DTO_Proforma = {
      ...proformaToDelete,
      estado: {
        ...(proformaToDelete.estado ?? { tabla: "" }),
        iD_Estado: STATUS_TBL.PROFORMA.DELETED,
        nombre: "Eliminado",
      },
    };
    proformaService.actualizarProformas(updated).subscribe({
      next: (res: DTO_Respuesta) => {
        if (res?.codigo === "B045") {
          notificationHelpers.infoAlert("Proforma eliminada correctamente");
        } else {
          notificationHelpers.warningAlert(
            res?.mensaje || "No se pudo eliminar"
          );
        }
      },
      error: (err) => {
        errorHelpers.serverError(err);
      },
    });

    setProformaToDelete(null);
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };

  const confirmModalAction = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsRegisterFormOpen(false);
        notificationHelpers.infoAlert("Registro cancelado");
      } else if (confirmContext === "delete") {
        handleConfirmDelete(true);
      }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
    setErroresValidacion([]);
  };
  //#endregion

  //#region 🔧 Renderizadores
  const customRenderers = {
    fechaProforma: (val: unknown) =>
      val ? new Date(String(val)).toLocaleDateString("es-CR") : "",
    fechaVencimiento: (val: unknown) =>
      val ? new Date(String(val)).toLocaleDateString("es-CR") : "",
    totalCalculado: (val: unknown) => formatColones(Number(val) || 0),
    subTotal: (val: unknown) => formatColones(Number(val) || 0),
    baseImponible: (val: unknown) => formatColones(Number(val) || 0),
    montoDescuento: (val: unknown) => formatColones(Number(val) || 0),
    montoImpuesto: (val: unknown) => formatColones(Number(val) || 0),
    descuentoProforma: (val: unknown, row?: DTO_Proforma) => {
      if (row?.descuentoPorcentualProforma) {
        return typeof val === "number" ? `${val}%` : "0%";
      }
      return formatColones(Number(val) || 0);
    },
    impuestoPorcentualProforma: (val: unknown) =>
      typeof val === "number" ? `${val}%` : "0%",
    cliente: (val: unknown) => {
      if (!val) {
        return (
          <span className="d-flex align-items-center text-muted">
            <i className="bi bi-person-x me-2"></i>
            Sin cliente asignado
          </span>
        );
      }
      if (typeof val === "object") {
        const c = val as { nombreCliente?: string; apellidoCliente?: string };
        const nombreCompleto = [
          c.nombreCliente?.trim(),
          c.apellidoCliente?.trim(),
        ]
          .filter(Boolean)
          .join(" ");
        if (nombreCompleto) return nombreCompleto;
      }
      return (
        <span className="d-flex align-items-center text-muted">
          <i className="bi bi-person-x me-2"></i>
          Sin cliente asignado
        </span>
      );
    },
  };
  //#endregion

  //#region 🔑 InfoModal
  //   const infoModalFields: FieldConfig<DTO_Proforma>[] = [
  //     ...keysInfoModalProforma,
  //     {
  //       key: "montoTotal",
  //       label: "Monto total",
  //       type: "custom",
  //       order: 10,
  //       renderer: ({ value }) => (
  //         <div className="border rounded px-4 py-3 d-flex align-items-center justify-content-between shadow-sm">
  //           <i className="bi bi-cash-stack fs-4 text-gray-600 me-3"></i>
  //           {formatColones(Number(value) || 0)}
  //         </div>
  //       ),
  //     },
  //   ];
  //#endregion

  return (
    <div className="row p-4 gx-0">
      {loading ? (
        <LoadingPanel msj="Cargando Proformas, por favor espere..." />
      ) : (
        <GenericDataTable<DTO_Proforma>
          ref={tableRef}
          title="Proformas"
          columnKeys={columnKeysProforma}
          labelMap={labelMapProforma}
          data={proformas}
          independent
          idField="iD_Proforma"
          onAdd={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={setRowTableSelected}
          includeEstadoColumn
          customRenderers={customRenderers}
          nowrapColumns={[
            "iD_Proforma",
            "totalCalculado",
            "cliente",
            "montoDescuento",
            "subTotal",
            "baseImponible",
            "montoImpuesto",
          ]}
        />
      )}

        <ProformaCrearModal
        show={showCrearProforma}
        onClose={()=>setShowCrearProforma(false)}
        onRegistered={(nuevoProforma: DTO_Proforma)=> {
          if (tableRef.current) {
            tableRef.current.upsert(nuevoProforma);
          }
          setShowCrearProforma(false);
        }}
      />

      {/* <InfoModal
        show={!!rowTableSelected}
        onHide={() => setRowTableSelected(undefined)}
        data={rowTableSelected!}
        fields={infoModalFields}
      /> */}

      {/* <GenericFormModal
        title="Registrar Proforma"
        show={isRegisterFormOpen}
        onHide={handleCancelAdd}
        data={registerFormData}
        setData={setRegisterFormData}
        onSubmit={handleSave}
        fields={proformaFormAddFields}
        erroresValidacion={erroresValidacion}
        onEliminarError={eliminarError}
      /> */}

      {/* <GenericFormModal
        title="Editar Proforma"
        show={showEditForm}
        onHide={() => setShowEditForm(false)}
        data={editData}
        setData={setEditData}
        onSubmit={handleSaveEdit}
        fields={proformaFormEditFields}
        erroresValidacion={erroresValidacion}
        onEliminarError={eliminarError}
      /> */}

      <ConfirmModal
        show={isConfirmOpen}
        confirmMessage={confirmModalMessage}
        onAction={confirmModalAction}
      />
    </div>
  );
};
