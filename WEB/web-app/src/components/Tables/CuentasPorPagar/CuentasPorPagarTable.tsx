import { useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import { DTO_CuentasPorPagar } from "@/models";
import { labelCuentasPorPagar } from "@/utils";
import { CoreDataTable } from "@/components";

interface DataTableProps {
  data: DTO_CuentasPorPagar[];
  onAdd: () => void;
  onEdit: (rowData: DTO_CuentasPorPagar) => void;
  onDelete: (rowData: DTO_CuentasPorPagar) => void;
  disableButtonAdd?: boolean;
}

export const CuentasPorPagarTable = ({
  data,
  onAdd,
  onEdit,
  onDelete,
  disableButtonAdd,
}: DataTableProps) => {
  const tableRef = useRef<HTMLTableElement>(null);

  const columns = [
    { title: "ID", data: "iD_CuentasPorPagar" },
    { title: "Negocio", data: "iD_Negocio" },
    { title: "Concepto", data: "concepto" },
    { title: "Descripción", data: "descripcion" },
    {
      title: "Saldo",
      data: "saldo",
      render: $.fn.dataTable.render.number(",", ".", 2, "₡"),
    },
    {
      title: "Fecha Inicial",
      data: "fechaInicial",
      render: (data: string) => new Date(data).toLocaleDateString(),
    },
    {
      title: "Fecha Modificación",
      data: "fechaModificacion",
      render: (data: string) => new Date(data).toLocaleDateString(),
    },
    {
      title: "Estado",
      data: null,
      render: (_data: unknown, _type: unknown, row: DTO_CuentasPorPagar) => {
        const isActivo = row.estado?.nombre?.toLowerCase() === "activo";
        const badgeClass = isActivo
          ? "badge badge-light-success"
          : "badge badge-light-primary";
        return `<span class="${badgeClass}">${
          row.estado?.nombre || "N/A"
        }</span>`;
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
  }, [data, onEdit, onDelete]);

  return (
    <CoreDataTable<DTO_CuentasPorPagar>
      title="Cuentas por Pagar"
      data={data}
      handleAdd={onAdd}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      disabeldButtonAdd={disableButtonAdd}
      labelMap={labelCuentasPorPagar}
    />
  );
};
