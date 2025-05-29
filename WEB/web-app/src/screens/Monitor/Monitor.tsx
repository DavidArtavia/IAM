import { CuentasPorPagarTable } from "@/components";
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
  useEffect(() => {
    if (selectedBusiness) {
      cuentasService.obtenerCuentasPorPagar(selectedBusiness).subscribe({
        next: (result) =>
          setAccountsPayable(
            procesarRespuesta(
              result as unknown as DTO_Respuesta
            ) as Array<DTO_CuentasPorPagar>
          ),
        error: (err) => errorHelpers.serverError(err),
        complete: () => {},
      });
    }
  }, [selectedBusiness]);

  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
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
          onDelete={(rowData) => handleDelete(rowData)}
          onEdit={(rowData) => handleEdit(rowData)}
        />
      </div>
    </>
  );
};
