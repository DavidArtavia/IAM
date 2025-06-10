// src/components/GenericDataTable.tsx
import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import ReactDOM from "react-dom/client";
import { InfoModal, ActionButtons, ReferenciaCards } from "@/components";

type ColumnSettings = DataTables.ColumnSettings;

export interface GenericDataTableProps<T> {
  title: string;
  columnKeys: (keyof T)[];
  labelMap: Record<string, string>;
  data: T[];
  onAdd: () => void;
  onEdit: (rowData: T) => void;
  onDelete: (rowData: T) => void;
  disableButtonAdd?: boolean;
  customRenderers?: {
    [K in keyof T]?: (
      value: unknown,
      rowData: T
    ) => string | number | React.ReactNode;
  };
  includeEstadoColumn?: boolean;
  includeReferenceColumn?: boolean;
}

export function GenericDataTable<T>({
  title,
  columnKeys,
  labelMap,
  data,
  onAdd,
  onEdit,
  onDelete,
  disableButtonAdd,
  customRenderers = {},
  includeEstadoColumn = false,
  includeReferenceColumn = false,
}: GenericDataTableProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedData, setSelectedData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!tableRef.current) return;

    // Destruir previa
    if ($.fn.dataTable.isDataTable(tableRef.current)) {
      const inst = $(tableRef.current).DataTable();
      inst.clear().destroy();
      $(tableRef.current).empty();
    }

    const dtColumns: ColumnSettings[] = [];

    // Columnas base
    columnKeys.forEach((key) => {
      const col: ColumnSettings = {
        title: labelMap[String(key)] || String(key),
        data: String(key),
      };
      // personalizaciones...
      if (customRenderers[key]) {
        col.render = (cv, _, rd) => {
          const out = customRenderers[key]!(cv, rd);
          return React.isValidElement(out) ? String(out) : out;
        };
      }
      dtColumns.push(col);
    });

    //  columna “Referencias” SOLO si includeReferenceColumn===true
    if (includeReferenceColumn && labelMap["referenciaJSON"]) {
      dtColumns.push({
        title: labelMap["referenciaJSON"],
        data: "referenciaJSON",
        orderable: false,
        searchable: false,
        defaultContent: "<div></div>",
        createdCell: (cell: Node, _cellData: unknown, rowData: T) => {
          const td = cell as HTMLTableCellElement;
          td.innerHTML = "";
          const items = (
            rowData as T & {
              referenciaJSON?: Array<{ nombre: string; valor: string }>;
            }
          )?.referenciaJSON as Array<{
            nombre: string;
            valor: string;
          }>;
          const root = ReactDOM.createRoot(td);
          root.render(
            <ReferenciaCards items={Array.isArray(items) ? items : []} />
          );
        },
      });
    }

    if (includeEstadoColumn && labelMap["estado"]) {
      dtColumns.push({
        title: labelMap["estado"] || "Estado",
        data: null, // ya no viene directo de un key: lo procesaremos en createdCell
        orderable: false,
        searchable: false,
        defaultContent: "<div></div>",
        createdCell: (cell: Node, _cellData: unknown, rowData: T) => {
          const td = cell as HTMLTableCellElement;
          td.innerHTML = "";
          const estado = (rowData as T & { estado?: { nombre?: string } })
            .estado;
          const nombreEstado = estado?.nombre ?? "N/A";
          const cls =
            nombreEstado.toLowerCase() === "activo"
              ? "badge badge-light-success"
              : nombreEstado.toLowerCase() === "pendiente" //<<<<<<< CAMBIAR
              ? "badge badge-light-warning"
              : "badge badge-light-primary";

          const root = ReactDOM.createRoot(td);
          root.render(<span className={cls}>{nombreEstado}</span>);
        },
      });
    }

    // Acciones
    const actionRoots: ReactDOM.Root[] = [];
    dtColumns.push({
      title: "Acciones",
      data: null,
      orderable: false,
      searchable: false,
      defaultContent: "<div></div>",
      createdCell: (cell: Node, _cd, rd) => {
        const td = cell as HTMLTableCellElement;
        td.innerHTML = "";
        const root = ReactDOM.createRoot(td);
        actionRoots.push(root);
        root.render(
          <ActionButtons
            rowData={rd}
            onEdit={() => onEdit(rd)}
            onDelete={() => onDelete(rd)}
          />
        );
      },
    });

    // Inicializar DataTable
    const table = $(tableRef.current).DataTable({
      data,
      columns: dtColumns,
      columnDefs: [{ targets: "_all", className: "text-center" }],
      order: [[0, "desc"]],
      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "No se encontraron resultados",
        info: "Mostrando página _PAGE_ de _PAGES_",
        infoEmpty: "No hay registros disponibles",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        paginate: {
          first: "Primero",
          last: "Último",
          previous: "Anterior",
          next: "Siguiente",
        },
      },
      destroy: true,
    });

    // Click en fila
    $(tableRef.current).off("click", "tbody tr");
    $(tableRef.current).on("click", "tbody tr", function () {
      const row = table.row(this);
      if (row.any()) {
        setSelectedData(row.data() as Record<string, unknown>);
        setShowInfoModal(true);
      }
    });

    return () => {
      table.destroy();
      setTimeout(() => {
        actionRoots.forEach((r) => r.unmount());
      }, 0);
    };
  }, [ data ]);

  return (
    <>
      <InfoModal
        show={showInfoModal}
        onHide={() => setShowInfoModal(false)}
        data={selectedData}
        labelMap={labelMap}
      />
      <div className="card shadow-sm mt-5">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title text-gray-600">{title}</h3>
          <button
            disabled={disableButtonAdd}
            onClick={onAdd}
            className="btn btn-primary"
          >
            Agregar
          </button>
        </div>
        <div className="card-body table-responsive">
          <table
            ref={tableRef}
            className="table table-striped table-hover align-middle text-center"
          />
        </div>
      </div>
    </>
  );
}
