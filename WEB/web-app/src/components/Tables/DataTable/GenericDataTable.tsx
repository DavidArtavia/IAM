import React, { useEffect, useRef, useMemo, useState } from "react";
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
  onOpenItemsModal?: (rowData: T) => void;
  disableButtonAdd?: boolean;
  customRenderers?: Partial<{
    [K in keyof T]: (value: unknown, rowData: T) => React.ReactNode;
  }>;
  includeEstadoColumn?: boolean;
  includeReferenceColumn?: boolean;
  modalInfoFields?: (keyof T)[];
  showItemsButton?: boolean;
  datekeys?: string[];
}

export function GenericDataTable<T>({
  title,
  columnKeys,
  labelMap,
  data,
  onAdd,
  onEdit,
  onDelete,
  onOpenItemsModal,
  disableButtonAdd = false,
  customRenderers = {},
  includeEstadoColumn = false,
  includeReferenceColumn = false,
  modalInfoFields,
  showItemsButton = false,
  datekeys,
}: GenericDataTableProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, unknown>>({});

  //#region 🔧 Columnas dinámicas DataTable
  const dtColumns = useMemo<ColumnSettings[]>(() => {
    const cols: ColumnSettings[] = [];

    const availableKeys = data.reduce<Set<string>>((set, row) => {
      Object.keys(row as Record<string, unknown>).forEach((k) => set.add(k));
      return set;
    }, new Set<string>());

    columnKeys.forEach((key) => {
      const keyStr = String(key);
      if (data.length === 0 || availableKeys.has(keyStr)) {
        const col: ColumnSettings = {
          title: labelMap[keyStr] || keyStr,
          data: keyStr,
          defaultContent: "",
        };

        if (customRenderers[key]) {
          col.render = (val, _, row) => {
            try {
              return customRenderers[key]!(val, row as T);
            } catch (error) {
              console.warn(`Render error (${keyStr})`, error);
              return val || "";
            }
          };
        }

        cols.push(col);
      }
    });

    //#region 🧷 Columna Referencias JSON
    if (includeReferenceColumn && labelMap["referenciaJSON"]) {
      cols.push({
        title: labelMap["referenciaJSON"],
        data: null,
        orderable: false,
        searchable: false,
        defaultContent: "",
        createdCell: (cell, _, row) => {
          try {
            const container = document.createElement("div");
            (cell as HTMLElement).innerHTML = "";
            cell.appendChild(container);
            ReactDOM.createRoot(container).render(
              <ReferenciaCards items={(row as any).referenciaJSON || []} />
            );
          } catch (err) {
            console.warn("Error ref JSON", err);
          }
        },
      });
    }
    //#endregion

    //#region 📊 Columna Avance (barra de progreso)
    if (labelMap["avance"]) {
      cols.push({
        title: labelMap["avance"],
        data: null,
        orderable: false,
        searchable: false,
        defaultContent: "",
        createdCell: (cell, _, row) => {
          try {
            const container = document.createElement("div");
            (cell as HTMLElement).innerHTML = "";
            cell.appendChild(container);
            const porcentaje = row["avance"] ?? 0;
            const barColor =
              porcentaje >= 80
                ? "bg-success"
                : porcentaje >= 50
                  ? "bg-warning"
                  : "bg-danger";

            const content = (
              <div className="d-flex flex-column w-100 me-2">
                <div className="d-flex flex-stack mb-2">
                  <span className="text-muted me-2 fs-7 fw-bold">
                    {porcentaje}%
                  </span>
                </div>
                <div className="progress h-6px w-100">
                  <div
                    className={`progress-bar ${barColor}`}
                    role="progressbar"
                    style={{ width: `${porcentaje}%` }}
                    aria-valuenow={porcentaje}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>
            );

            ReactDOM.createRoot(container).render(content);
          } catch (error) {
            console.warn("Error render Avance", error);
          }
        },
      });
    }
    //#endregion

    //#region 🟢 Columna Estado
    if (includeEstadoColumn && labelMap["estado"]) {
      cols.push({
        title: labelMap["estado"],
        data: null,
        orderable: false,
        searchable: false,
        defaultContent: "",
        createdCell: (cell, _, row) => {
          try {
            const estado: string =
              (row as any)?.estado?.nombre?.toLowerCase() ?? "N/A";

            const badgeClassMap: Record<string, string> = {
              activo: "badge-light-success",
              nuevo: "badge badge-secondary",
              "en proceso": "badge-light-primary",
              "en espera": "badge-light-warning",
              completado: "badge-light-success",
              eliminado: "badge-light-danger",
              inactivo: "badge-light-light",
              default: "badge badge-dark",
            };

            const badgeClass =
              badgeClassMap[estado] || badgeClassMap["default"];

            const container = document.createElement("span");
            (cell as HTMLElement).innerHTML = "";
            cell.appendChild(container);
            ReactDOM.createRoot(container).render(
              <span className={`badge ${badgeClass}`}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </span>
            );
          } catch (err) {
            console.warn("Estado error:", err);
          }
        },
      });
    }
    //#endregion

    //#region 🛠️ Columna Acciones
    cols.push({
      title: "Acciones",
      data: null,
      orderable: false,
      searchable: false,
      defaultContent: "",
      createdCell: (cell, _, row) => {
        try {
          const container = document.createElement("div");
          (cell as HTMLElement).innerHTML = "";
          cell.appendChild(container);
          ReactDOM.createRoot(container).render(
            <ActionButtons
              rowData={row as T}
              onEdit={() => onEdit(row as T)}
              onDelete={() => onDelete(row as T)}
              showItemsButton={showItemsButton}
              onOpenModal={() => onOpenItemsModal?.(row as T)}
            />
          );
        } catch (err) {
          console.warn("Error render actions", err);
        }
      },
    });
    //#endregion

    return cols;
  }, [data]);
  //#endregion

  //#region 🧠 Inicialización tabla con jQuery DataTable
  useEffect(() => {
    const table = tableRef.current;
    if (!table || dtColumns.length === 0) return;

    if ($.fn.dataTable.isDataTable(table)) {
      $(table).DataTable().destroy();
      $(table).empty();
    }

    try {
      $(table).DataTable({
        data,
        columns: dtColumns,
        columnDefs: [
          { targets: "_all", className: "text-center", defaultContent: "" },
        ],
        order: [[0, "desc"]],
        language: {
          search: "Buscar:",
          emptyTable: "No hay datos disponibles",
          lengthMenu: "Mostrar _MENU_ registros",
          zeroRecords: "No se encontraron resultados",
          info: "Mostrando página _PAGE_ de _PAGES_",
          infoEmpty: "Sin registros",
          paginate: {
            first: "Primero",
            last: "Último",
            previous: "Anterior",
            next: "Siguiente",
          },
        },
        layout: {
          topStart: {
            buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
          }
        },
        deferRender: true,
        destroy: true,
      });

      const dtInstance = $(table).DataTable();
      $(table)
        .off("click", "tbody tr")
        .on("click", "tbody tr", function () {
          const row = dtInstance.row(this);
          if (!row.any()) return;

          const rawData = row.data() as T;
          const detail = modalInfoFields
            ? modalInfoFields.reduce((acc, key) => {
              acc[String(key)] = rawData[key];
              return acc;
            }, {} as Record<string, unknown>)
            : (rawData as Record<string, unknown>);

          setDetailData(detail);
          setShowInfo(true);
        });
    } catch (err) {
      console.error("DataTable error", err);
    }
  }, [dtColumns, modalInfoFields]);
  //#endregion

  //#region 🔁 Actualización de datos al cambiar props
  useEffect(() => {
    const table = tableRef.current;
    if (!table || !$.fn.dataTable.isDataTable(table)) return;

    try {
      const dtInstance = $(table).DataTable();
      dtInstance.clear().rows.add(data).draw();
    } catch (err) {
      console.warn("Data update error", err);
    }
  }, [data]);
  //#endregion

  //#region 🎨 Render
  return (
    <>
      <InfoModal
        show={showInfo}
        onHide={() => setShowInfo(false)}
        data={detailData}
        labelMap={labelMap}
        dateKeys={datekeys}
      />

      <div className="card shadow-sm mt-5">
        <div className="card-header d-flex justify-content-between align-items-center py-10 px-lg-17">
          <h3 className="card-title text-gray-600">{title}</h3>
          <button
            onClick={onAdd}
            className="btn btn-primary"
            disabled={disableButtonAdd}
          >
            Agregar
          </button>
        </div>
        <div className="card-body table-responsive p-2 py-10 px-lg-17">
          <table
            ref={tableRef}
            className="table table-sm table-striped table-hover align-middle text-center w-auto"
          />
        </div>
      </div>
    </>
  );
  //#endregion
}
