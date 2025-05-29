import {
  CuentasPorPagarTable,
  FormRegisterAccountModal,
  ConfirmModal,
} from "@/components";
import { BusinessButtons } from "@/components/Buttons/BusinessButtons";
import { DTO_Negocio, DTO_CuentasPorPagar, DTO_Respuesta } from "@/models";
import { cuentasService } from "@/services/cuentas.service";
import { errorHelpers, procesarRespuesta } from "@/utils";
import { useEffect, useState } from "react";

export const Monitor = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [accountsPayable, setAccountsPayable] = useState<
    Array<DTO_CuentasPorPagar>
  >([]);

  // Estado del modal para el formulario
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [formData, setFormData] = useState<DTO_CuentasPorPagar>(
    new DTO_CuentasPorPagar()
  );
  //Manejo del modal de confirmaciones
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [confirmModalMessage, setconfirmModalMessage] = useState<string>("");

  const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(true);

  useEffect(() => {
    if (selectedBusiness) {
      refetchAccounts();
    }
  }
  , [selectedBusiness]);

  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setDisableButtonAdd(false);
  };

  const handleAddNew = () => {
    setIsModalFormOpen(true);
  };

  const handleSave = () => {
    console.log("Datos guardados:", formData);
    const iD_Negocio = selectedBusiness?.iD_Negocio;
    formData.iD_Negocio = iD_Negocio || 0;

    cuentasService.registrarCuentasPorPagar(formData).subscribe({
      next: (result) => {
        const response = procesarRespuesta(
          result as unknown as DTO_Respuesta
        ) as DTO_CuentasPorPagar;

        if (response) {
          // Después de registrar, refrescamos toda la lista es momentáneo
          // ya que no se esta manejando el estado de la cuenta en especifico
          refetchAccounts();
        }
      },
      error: (err) => errorHelpers.serverError(err),
      complete: () => {
        setIsModalFormOpen(false);
        setFormData(new DTO_CuentasPorPagar());
      },
    });
  };

  const refetchAccounts = () => {
    if (selectedBusiness) {
      cuentasService.obtenerCuentasPorPagar(selectedBusiness).subscribe({
        next: (result) =>
          setAccountsPayable(
            procesarRespuesta(
              result as unknown as DTO_Respuesta
            ) as Array<DTO_CuentasPorPagar>
          ),
        error: (err) => errorHelpers.serverError(err),
      });
    }
  };
  

  const handleCancel = () => {
    setconfirmModalMessage(
      "¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán."
    );
    setIsConfirmOpen(true);
  };

  const confirmModalAcion = (action: boolean | null) => {
    if (action === true) {
      setFormData(new DTO_CuentasPorPagar());
      setIsModalFormOpen(false);
      // Aquí puedes manejar la acción de confirmación
      console.log("Acción descartar confirmada");
    }
    setIsConfirmOpen(false);
  };

  const handleDelete = (rowData: DTO_CuentasPorPagar) => {
    // El eliminar realiza la accion de colocar el estoda de esa cuanta en especifico en elimnado usando el update
    // rowData.estado.iD_Estado = 3; // Asignar el estado de eliminado
    // cuentasService
    //   .actualizarCuentaPorPagar(rowData)
    //   .subscribe({
    //     next: (result) => {
    //       const updatedAccounts = accountsPayable.map((account) =>
    //         account.iD_CuentasPorPagar === rowData.iD_CuentasPorPagar
    //           ? { ...account, estado: rowData.estado }
    //           : account
    //       );
    //       setAccountsPayable(updatedAccounts);
    //     },
    //     error: (err) => errorHelpers.serverError(err),    //   });
  };

  const handleEdit = (rowData: DTO_CuentasPorPagar) => {
    console.log("Edit row data:", rowData);
  };
  return (
    <>
      <div className="row p-4 col-12 gx-0">
        <BusinessButtons
          handleSelectBusiness={handleSelectBusiness}
          title="Negocios"
          selectedBusiness={selectedBusiness}
        />
        <CuentasPorPagarTable
          data={accountsPayable}
          onAdd={handleAddNew}
          onDelete={(rowData) => handleDelete(rowData)}
          onEdit={(rowData) => handleEdit(rowData)}
          disableButtonAdd={disableButtonAdd}
        />
        <FormRegisterAccountModal
          show={isModalFormOpen}
          onHide={handleCancel}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSave}
        />
        <ConfirmModal
          show={isConfirmOpen}
          confirmMessage={confirmModalMessage}
          onAction={(action) => confirmModalAcion(action)}
        />
      </div>
    </>
  );
};
