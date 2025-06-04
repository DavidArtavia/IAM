import { useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import { labelMapNegocio } from "@/utils";
import { CoreDataTable } from "@/components";
import { DTO_Negocio } from "@/models";

interface DataTableProps {
  data: DTO_Negocio[];
  onAdd: () => void;
  onEdit: (rowData: DTO_Negocio) => void;
  onDelete: (rowData: DTO_Negocio) => void;
  disableButtonAdd?: boolean;
}
export const NegociosTable = ({
  data,
  onAdd,
  onEdit,
  onDelete,
  disableButtonAdd,
}: DataTableProps) => {
  const tableRef = useRef<HTMLTableElement>(null);

  const columns = [
    { title: labelMapNegocio.iD_Negocio, data: "iD_Negocio" },
    { title: labelMapNegocio.iD_Usuario, data: "iD_Usuario" },
    { title: labelMapNegocio.nombreNegocio, data: "nombreNegocio" },
    { title: labelMapNegocio.descripcion, data: "descripcion" },
    { title: labelMapNegocio.direccion, data: "direccion" },
    { title: labelMapNegocio.telefonoNegocio, data: "telefonoNegocio" },
    { title: labelMapNegocio.correoNegocio, data: "correoNegocio" },
    {
      title: labelMapNegocio.fechaRegistro,
      data: "fechaRegistro",
      render: (fecha: string) => {
        return fecha ? new Date(fecha).toLocaleDateString() : "";
      },
    },
  ];

  useEffect(() => {
    if (tableRef.current) {
      const table = $(tableRef.current).DataTable({
        data: data,
        columns: columns,
        destroy: true,
      });
      return () => {
        table.destroy();
      };
    }
  }, [data]);

  return (
    <CoreDataTable<DTO_Negocio>
      title="Negocios Registrados"
      data={data}
      handleAdd={onAdd}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      disabeldButtonAdd={disableButtonAdd}
      labelMap={labelMapNegocio}
    />
  );
};
