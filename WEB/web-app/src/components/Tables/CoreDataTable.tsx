import { useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import ReactDOM from "react-dom/client";
import { DTO_CuentasPorPagar } from "@/models/DTO_CuentasPorPagar";
import { ActionButtons } from "../Buttons/ActionButtons";

type DataTableColumn = DataTables.ColumnSettings;


interface DataTableProps {
  title: string;
  columns?: DataTableColumn[];
  handleAdd: () => void;
  data: DTO_CuentasPorPagar[];
  onEdit: (rowData: DTO_CuentasPorPagar) => void;
  onDelete: (rowData: DTO_CuentasPorPagar) => void;
  disabeldButtonAdd?: boolean;
}

export const CoreDataTable = ({
  title,
  handleAdd,
  data,
  columns = [],
  onEdit,
  onDelete,
  disabeldButtonAdd,
}: DataTableProps) => {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    // 🔥 Si ya existe DataTable, límpialo completamente
    if ($.fn.dataTable.isDataTable(tableRef.current)) {
      const tableInstance = $(tableRef.current).DataTable();
      tableInstance.clear().destroy();
      $(tableRef.current).empty(); // limpia completamente el contenido
    }

    const reactRoots: ReactDOM.Root[] = [];

    const table = $(tableRef.current).DataTable({
      data,
      columns: [
        ...columns,
        {
          title: "Acciones",
          data: null,
          orderable: false,
          searchable: false,
          createdCell: (td, _cellData, rowData) => {
            (td as HTMLElement).innerHTML = "";
            const root = ReactDOM.createRoot(td as HTMLElement);
            reactRoots.push(root);
            root.render(
              <ActionButtons
                rowData={rowData}
                onEdit={() => onEdit(rowData)}
                onDelete={() => onDelete(rowData)}
              />
            );
          },
        },
      ],
      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "No se encontraron resultados",
        info: "Mostrando página _PAGE_ de _PAGES_",
        infoEmpty: "No hay registros disponibles",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        loadingRecords: "Cargando...",
        processing: "Procesando...",
        emptyTable: "No hay datos disponibles en la tabla",
        paginate: {
          first: "Primero",
          last: "Último",
          previous: "Anterior",
          next: "Siguiente",
        },
      },
      destroy: true,
    });

    $(tableRef.current).off("click", "tbody tr");

    $(tableRef.current).on("click", "tbody tr", function (this: HTMLElement) {
      const row = table.row(this);
      if (row.any()) {
        const rowData = row.data() as DTO_CuentasPorPagar;
        console.log("Fila seleccionada -->:", rowData);
      }
    });

    return () => {
      table.destroy();
      setTimeout(() => {
        reactRoots.forEach((root) => root.unmount());
      }, 0);
    };
  }, [data, columns, onEdit, onDelete]);
  

  return (
    <div className="card shadow-sm mt-5">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title text-gray-600">{title}</h3>
          <button
            disabled={disabeldButtonAdd}
            onClick={handleAdd}
            className="btn btn-primary"
          >
            Agregar
          </button>
        </div>
        <div className="card-body table-responsive">
          <table ref={tableRef} className="table table-striped" />
        </div>
      </div>
    </div>
  );
};
