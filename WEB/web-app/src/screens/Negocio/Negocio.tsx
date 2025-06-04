import { ConfirmModal, GenericFormModal, NegociosTable } from "@/components";
import { AuthContext } from "@/context";
import { DTO_Negocio, DTO_Respuesta } from "@/models";
import { negocioService } from "@/services";
import { errorHelpers, labelMapNegocio, negocioFormFields, notificationHelpers, procesarRespuesta } from "@/utils";
import { useContext, useEffect, useState } from "react";

export const Negocio = () => {
  // === Contexto pa aobtenr datos de usuario ===
  const { user } = useContext(AuthContext);
  // === Estados principales ===
  const [business, setBusiness] = useState<Array<DTO_Negocio>>([]);
  const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(false);

  // === Modal “Registrar” (Genérico) ===
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_Negocio>(new DTO_Negocio());

    // === Modal “Editar” (Genérico) ===
    const [showBusiness, setShowBusinessModal] = useState(false);
    const [editData, setEditData] = useState<DTO_Negocio | null>(null);
    const [rowBusinessSelected, setRowBusinessSelected] = useState<DTO_Negocio | null>(null);

  // === Modal de Confirmación ===
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmModalMessage, setconfirmModalMessage] = useState("");
  const [confirmContext, setConfirmContext] = useState<
    "cancelAdd" | "delete" | null
  >(null);

  // === Efecto para cargar los negocios al iniciar ===
  useEffect(() => {
    refetchAccounts();
  }, []);

  // === Refetch de Negocios ===
  const refetchAccounts = () => {
    negocioService.obtenerNegocios().subscribe({
      next: (result) => {
        setBusiness(
          procesarRespuesta(result as DTO_Respuesta) as Array<DTO_Negocio>
        );
      },
      error: (err) => errorHelpers.serverError(err),
      complete: () => {
        if (business.length <= 3) {
          // setDisableButtonAdd(true);
        }
      },
    });
  };
  // ========== “Registrar” ==========

  const handleAddNewBusiness = () => {
    setFormData(new DTO_Negocio());
    setIsModalFormOpen(true);
  };

  const handleSave = () => {
    formData.iD_Usuario = user?.iD_Usuario || 0;
    negocioService.registrarNegocio(formData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ??
          "Negocio registrado correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
        setIsModalFormOpen(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  //
  const handleCancel = () => {
    setconfirmModalMessage("¿Estás seguro de que deseas cancelar?");
    setConfirmContext("cancelAdd");
    setIsConfirmOpen(true);
  };

  // ========== “Editar” ==========
 const handleEdit = (rowData: DTO_Negocio) => {
    setRowBusinessSelected(rowData);
    setEditData({ ...rowData });
    setShowBusinessModal(true);
  };

 const handleSaveBusiness = (updatedData: DTO_Negocio) => {
    if (!rowBusinessSelected) return;
    updatedData.iD_Negocio = rowBusinessSelected.iD_Negocio;
    updatedData.iD_Usuario = user?.iD_Usuario  || 0;

    // Si no cambiaron el estado, lo dejamos como estaba
    if (!updatedData.estado && rowBusinessSelected.estado) {
      updatedData.estado = { ...rowBusinessSelected.estado };
    }

    negocioService.actualizarNegocio(updatedData).subscribe({
      next: (result: unknown) => {
        const mensaje =
          (result as DTO_Respuesta)?.mensaje ??
          "Negocio actualizado correctamente";
        notificationHelpers.successAlert(mensaje);
        refetchAccounts();
        setShowBusinessModal(false);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  // ========== “Confirmaciones” ==========
  const confirmModalAcion = (action: boolean | null) => {
    if (action) {
      if (confirmContext === "cancelAdd") {
        setIsModalFormOpen(false);
        notificationHelpers.infoAlert("Cambios descartados correctamente");
      }
      // else if (confirmContext === "delete" && accountToDelete) {
      //   handleConfirmDelete(true);
      // }
    }
    setIsConfirmOpen(false);
    setConfirmContext(null);
  };

  return (
    <>
      <div className="row p-4 col-12 gx-0">
        <NegociosTable
          data={business}
          onAdd={handleAddNewBusiness}
          onEdit={handleEdit}
          onDelete={() => {}}
          disableButtonAdd={disableButtonAdd}
        />

        {/* === Modal Genérico: Registrar Negocios === */}
        <GenericFormModal<DTO_Negocio>
          title="Registrar Negocio"
          show={isModalFormOpen}
          onHide={handleCancel}
          data={formData}
          setData={setFormData}
          onSubmit={handleSave}
          fields={negocioFormFields}
        />

        {/* ====== Modal Genérico: Editar Cuenta por Pagar ====== */}
        <GenericFormModal<DTO_Negocio>
          title="Editar datos del Negocio"
          show={showBusiness}
          onHide={() => setShowBusinessModal(false)}
          data={editData!}
          setData={(x) => setEditData(x as DTO_Negocio)}
          onSubmit={() => {
            // Llamamos a handleSaveEdit con el objeto editData
            if (editData) {
              handleSaveBusiness(editData);
            }
          }}
          fields={negocioFormFields}
        />

        {/* === Modal Genérico: Confirmación === */}
        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={(action) => confirmModalAcion(action)}
        />

        <div>
          {/* {business.map((negocio, idx) =>
          negocio.referenciaJSON && negocio.referenciaJSON.length > 0 ? (
            <div key={idx} style={{ marginTop: 24 }}>
            <h5>Referencia JSON - Negocio {negocio.nombreNegocio || idx + 1}</h5>
            {negocio.referenciaJSON.map((ref, refIdx) => (
              <pre
              key={refIdx}
              style={{
                background: "#f6f8fa",
                borderRadius: 8,
                padding: 16,
                fontSize: 14,
                color: "#24292f",
                maxHeight: 300,
                overflow: "auto",
                }}
                >
                {JSON.stringify(ref, null, 2)}
                </pre>
                ))}
                </div>
                ) : null
                )} */}
        </div>
      </div>
    </>
  );
};

