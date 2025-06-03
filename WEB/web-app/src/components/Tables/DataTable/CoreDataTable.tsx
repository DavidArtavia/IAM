import { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import ReactDOM from "react-dom/client";
import { InfoModal, ActionButtons } from "@/components";

type DataTableColumn = DataTables.ColumnSettings;

interface DataTableProps<T> {
  title: string;
  columns?: DataTableColumn[];
  handleAdd: () => void;
  data: T[];
  onEdit: (rowData: T) => void;
  onDelete: (rowData: T) => void;
  labelMap: Record<string, string>;
  disabeldButtonAdd?: boolean;
}

export const CoreDataTable = <T,>({
  title,
  handleAdd,
  data,
  columns = [],
  onEdit,
  onDelete,
  labelMap,
  disabeldButtonAdd,
}: DataTableProps<T>) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedData, setSelectedData] = useState<Record<string, unknown>>({});

  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    // 🔥 Si ya existe DataTable, limpiamos completamente
    if ($.fn.dataTable.isDataTable(tableRef.current)) {
      const tableInstance = $(tableRef.current).DataTable();
      tableInstance.clear().destroy();
      $(tableRef.current).empty(); // limpio completamente el contenido
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
      columnDefs: [{ targets: "_all", className: "text-center" }],
      order: [[0, "desc"]],
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
        const rowData = row.data();
        setSelectedData(rowData as Record<string, unknown>);
        setShowInfoModal(true);
      }
    });
    return () => {
      table.destroy();
      setTimeout(() => {
        reactRoots.forEach((root) => root.unmount());
      }, 0);
    };
  }, [data]);

  return (
    <>
      <InfoModal
        show={showInfoModal}
        onHide={() => setShowInfoModal(false)}
        data={selectedData}
        labelMap={labelMap}
      />
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
            <div className="table-responsive">
              {/* start table */}
              <table
                id="example"
                ref={tableRef}
                className="table table-striped gs-7 table-hover gy-4 align-middle text-center"
              />
            </div>
            {/* end table */}
          </div>
        </div>
      </div>
    </>
  );
};
