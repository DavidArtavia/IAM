import React, { useEffect, useRef, useMemo, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import ReactDOM from "react-dom/client";
import { InfoModal, ActionButtons, ReferenciaCards } from "@/components";

// Import RefItem type from ReferenciasJson
import type { RefItem } from "@/components/ReferenciasJson/ReferenciasJson";

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
  customRenderers?: Partial<{
    [K in keyof T]: (value: unknown, rowData: T) => React.ReactNode;
  }>;
  includeEstadoColumn?: boolean;
  includeReferenceColumn?: boolean;
  modalInfoFields?: (keyof T)[];
}

export function GenericDataTable<T>({
  title,
  columnKeys,
  labelMap,
  data,
  onAdd,
  onEdit,
  onDelete,
  disableButtonAdd = false,
  customRenderers = {},
  includeEstadoColumn = false,
  includeReferenceColumn = false,
  modalInfoFields,
}: GenericDataTableProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, unknown>>({});

  // Generate DataTables columns - FILTRAR SOLO COLUMNAS QUE EXISTEN EN LOS DATOS
  const dtColumns = useMemo<ColumnSettings[]>(() => {
    const cols: ColumnSettings[] = [];

    // Verificar qué columnas realmente existen en los datos
    // const availableKeys =
    //   data.length > 0
    //     ? Object.keys(data[0] as Record<string, unknown>)
    //     : columnKeys.map(String);

    const availableKeys = data.reduce<Set<string>>((set, row) => {
      Object.keys(row as Record<string, unknown>).forEach((k) => set.add(k));
      return set;
    }, new Set<string>());

    // Base columns - solo incluir las que existen en los datos
    columnKeys.forEach((key) => {
      const keyStr = String(key);

      // Solo agregar la columna si existe en los datos o si no hay datos aún
      if (data.length === 0 || availableKeys.has(keyStr)) {
        const col: ColumnSettings = {
          title: labelMap[keyStr] || keyStr,
          data: keyStr,
          // Agregar manejo de errores para columnas que no existen
          defaultContent: "",
        };

        if (customRenderers[key]) {
          col.render = (dataValue, _, rowData) => {
            try {
              return customRenderers[key]!(dataValue, rowData as T);
            } catch (error) {
              console.warn(`Error rendering column ${keyStr}:`, error);
              return dataValue || "";
            }
          };
        }

        cols.push(col);
      }
    });

    // Optional reference column
    if (includeReferenceColumn && labelMap["referenciaJSON"]) {
      cols.push({
        title: labelMap["referenciaJSON"],
        data: null,
        orderable: false,
        searchable: false,
        defaultContent: "",
        createdCell: (cell, _, rowData) => {
          try {
            const container = document.createElement("div");
            (cell as HTMLElement).innerHTML = "";
            cell.appendChild(container);
            const root = ReactDOM.createRoot(container);
            root.render(
              <ReferenciaCards
                items={
                  (rowData as T & { referenciaJSON?: RefItem[] })
                    .referenciaJSON || []
                }
              />
            );
          } catch (error) {
            console.warn("Error rendering reference column:", error);
            (cell as HTMLElement).innerHTML = "";
          }
        },
      });
    }

    // Optional estado column
    if (includeEstadoColumn && labelMap["estado"]) {
      cols.push({
        title: labelMap["estado"] || "Estado",
        data: null,
        orderable: false,
        searchable: false,
        defaultContent: "",
        createdCell: (cell, _, rowData) => {
          try {
            const container = document.createElement("span");
            (cell as HTMLElement).innerHTML = "";
            cell.appendChild(container);
            type Estado = { nombre?: string };
            const estadoObj: Estado =
              (rowData as { estado?: Estado }).estado || {};
            const nombre: string = estadoObj.nombre ?? "N/A";
            const badgeClassMap: Record<string, string> = {
              activo: "badge-light-success",
              pendiente: "badge-light-warning",
            };
            const badgeClass =
              badgeClassMap[nombre.toLowerCase()] || "badge-light-primary";
            const root = ReactDOM.createRoot(container);
            root.render(
              <span className={`badge ${badgeClass}`}>{nombre}</span>
            );
          } catch (error) {
            console.warn("Error rendering estado column:", error);
            (cell as HTMLElement).innerHTML = "N/A";
          }
        },
      });
    }

    // Actions column
    cols.push({
      title: "Acciones",
      data: null,
      orderable: false,
      searchable: false,
      defaultContent: "",
      createdCell: (cell, _, rowData) => {
        try {
          const container = document.createElement("div");
          (cell as HTMLElement).innerHTML = "";
          cell.appendChild(container);
          const root = ReactDOM.createRoot(container);
          root.render(
            <ActionButtons
              rowData={rowData as T}
              onEdit={() => onEdit(rowData as T)}
              onDelete={() => onDelete(rowData as T)}
            />
          );
        } catch (error) {
          console.warn("Error rendering action buttons:", error);
          (cell as HTMLElement).innerHTML = "";
        }
      },
    });

    return cols;
  }, [
    columnKeys,
    labelMap,
    customRenderers,
    includeEstadoColumn,
    includeReferenceColumn,
    onEdit,
    onDelete,
    data, // Agregar data como dependencia
  ]);

  // Initialize DataTable once
  useEffect(() => {
    const tableEl = tableRef.current;
    if (!tableEl) return;

    // Destroy old instance if 
    if ($.fn.dataTable.isDataTable(tableEl)) {
      $(tableEl).DataTable().destroy();
      $(tableEl).empty();
    }

    // Solo inicializar si tenemos columnas válidas
    if (dtColumns.length === 0) return;

    try {
      $(tableEl).DataTable({
        data,
        columns: dtColumns,
        columnDefs: [
          {
            targets: "_all",
            className: "text-center",
            // Manejar datos faltantes globalmente
            defaultContent: "",
          },
        ],
        order: [[0, "desc"]],
        language: {
          search: "Buscar:",
          infoPostFix: "",
          emptyTable: "No hay datos disponibles en la tabla",
          decimal: ",",
          thousands: ".",
          loadingRecords: "Cargando...",
          processing: "Procesando...",
          infoFiltered: "(filtrado de _MAX_ registros totales)",       
          lengthMenu: "Mostrar _MENU_ registros por página",
          zeroRecords: "No se encontraron resultados",
          info: "Mostrando página _PAGE_ de _PAGES_",
          infoEmpty: "No hay registros disponibles",
          paginate: {
            first: "Primero",
            last: "Último",
            previous: "Anterior",
            next: "Siguiente",
          },
        },
        destroy: true,
        // Configuraciones adicionales para manejar errores
        deferRender: true,
        processing: false,
        serverSide: false,
      });

      // Row click handler
      const table = $(tableEl).DataTable();
      $(tableEl)
        .off("click", "tbody tr")
        .on("click", "tbody tr", function () {
          const row = table.row(this);
          if (!row.any()) return;

          try {
            const rawData = row.data() as T;
            // Si nos pasaron modalFields, construimos un objeto sólo con esas claves;
            // si no, usamos todo el rawData.
            const detail = modalInfoFields
              ? modalInfoFields.reduce<Record<string, unknown>>((acc, key) => {
                  acc[String(key)] = rawData[key];
                  return acc;
                }, {})
              : (rawData as Record<string, unknown>);

            setDetailData(detail);
            setShowInfo(true);
          } catch (error) {
            console.warn("Error handling row click:", error);
          }
        });
    } catch (error) {
      console.error("Error initializing DataTable:", error);
    }
  }, [dtColumns, modalInfoFields]);

  // Update rows when data changes
  useEffect(() => {
    const tableEl = tableRef.current;
    if (!tableEl || !$.fn.dataTable.isDataTable(tableEl)) return;

    try {
      const table = $(tableEl).DataTable();
      table.clear().rows.add(data).draw();
    } catch (error) {
      console.warn("Error updating table data:", error);
    }
  }, [data]);

  return (
    <>
      <InfoModal
        show={showInfo}
        onHide={() => setShowInfo(false)}
        data={detailData}
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
