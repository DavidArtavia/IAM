import { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
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
  const columns: DataTables.ColumnSettings[] = [
    {
      title: labelCuentasPorPagar.iD_CuentasPorPagar,
      data: "iD_CuentasPorPagar",
    },
    {
      title: labelCuentasPorPagar.iD_Negocio,
      data: "iD_Negocio",
    },
    {
      title: labelCuentasPorPagar.concepto,
      data: "concepto",
    },
    {
      title: labelCuentasPorPagar.descripcion,
      data: "descripcion",
    },
    {
      title: labelCuentasPorPagar.saldo,
      data: "saldo",
      render: $.fn.dataTable.render.number(",", ".", 2, "₡"),
    },
    {
      title: labelCuentasPorPagar.fechaInicial,
      data: "fechaInicial",
      render: (data: string) => new Date(data).toLocaleDateString(),
    },
    {
      title: labelCuentasPorPagar.fechaModificacion,
      data: "fechaModificacion",
      render: (data: string) => new Date(data).toLocaleDateString(),
    },
    {
      title: labelCuentasPorPagar.estado,
      data: null,
      orderable: false,
      defaultContent: "<div></div>",
      createdCell: (
        cell: Node,
        _cellData: unknown,
        rowData: DTO_CuentasPorPagar
      ) => {
        // 1) Convertimos "cell" a HTMLTableCellElement
        const td = cell as HTMLTableCellElement;
        td.innerHTML = "";

        // 2) Sacamos el nombre del estado (no todo el objeto)
        const nombreEstado = rowData.estado?.nombre ?? "N/A";
        // 3) Definimos la clase según el texto de "nombreEstado"
        const badgeClass =
          nombreEstado.toLowerCase() === "activo"
            ? "badge badge-light-success"
            : nombreEstado.toLowerCase() === "pendiente"
            ? "badge badge-light-warning"
            : "badge badge-light-primary";

        // 4) Montamos un <span> con React dentro de ese <td>
        const root = ReactDOM.createRoot(td);
        root.render(<span className={badgeClass}>{nombreEstado}</span>);
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
