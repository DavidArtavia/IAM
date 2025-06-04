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
  // Use DataTables.ColumnSettings[] for proper typing
  // Helper to map label keys to data keys
  const columnKeys = [
    "iD_CuentasPorPagar",
    "iD_Negocio",
    "concepto",
    "descripcion",
    "saldo",
    "fechaInicial",
    "fechaModificacion",
  ];

  const columns: DataTables.ColumnSettings[] = columnKeys.map((key) => {
    const col: DataTables.ColumnSettings = {
      title: labelCuentasPorPagar[key],
      data: key,
    };

    if (key === "saldo") {
      col.render = $.fn.dataTable.render.number(",", ".", 2, "₡");
    }
    if (key === "fechaInicial" || key === "fechaModificacion") {
      col.render = (data: string) => new Date(data).toLocaleDateString();
    }
    return col;
  });

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
