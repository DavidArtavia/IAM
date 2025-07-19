import React, { useEffect, useRef, useMemo } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import DataTable from "datatables.net-dt";
import JsZip from "jszip";
import Buttons from "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.html5.js";

import ReactDOM from "react-dom/client";
import { useApp } from "@/hooks/useApp";
import { ActionButtons } from "@/components";

type ColumnSettings = DataTables.ColumnSettings;

declare global {
  interface Window {
    JSZip: typeof JsZip;
  }
}

window.JSZip = JsZip;

function formatDetalleJSON(
  detalle: any,
  type: "display" | "export" | "filter" | "sort" = "display"
): string {
  const filas = detalle?.filas ?? [];
  const desc = detalle?.descuento?.valor ?? "0";
  const tipoDesc = detalle?.descuento?.nombre ?? "Monto";
  const imp = detalle?.impuesto?.valor ?? "0";

  const descStr =
    tipoDesc === "Monto"
      ? `Desc: ₡${Number(desc).toLocaleString("es-CR", {
          minimumFractionDigits: 2,
        })}`
      : `Desc: ${Number(desc)}%`;

  const impStr = `Imp: ${Number(imp)}%`;

  let filasStr = "Filas: ";
  if (filas.length === 0) {
    filasStr += "0";
  } else {
    const limit = 2;
    const mapped = filas.slice(0, limit).map(
      (f: any) =>
        `${f.nombre}: ${Number(f.valor).toLocaleString("es-CR", {
          minimumFractionDigits: 2,
        })}`
    );
    filasStr += mapped.join(", ");
    if (filas.length > limit) filasStr += ", ...";
  }

  if (type === "export" || type === "filter" || type === "sort") {
    return `${descStr}, ${impStr}, ${filasStr}`;
  }

  return `
    <div class="d-flex flex-column gap-1">
      <div class="badge rounded-pill bg-primary-subtle text-dark fw-semibold px-2 py-1 fs-9 shadow-sm" style="font-size: 0.85rem;">${descStr}</div>
      <div class="badge rounded-pill bg-info-subtle text-dark fw-semibold px-2 py-1 fs-9 shadow-sm" style="font-size: 0.85rem;">${impStr}</div>
      <div class="badge rounded-pill bg-secondary-subtle text-dark fw-semibold px-2 py-1 fs-9 shadow-sm" style="font-size: 0.85rem;">${filasStr}</div>
    </div>
  `;
}


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
  showItemsButton?: boolean;
  customColumns?: ColumnSettings[];
  onRowClick?: (rowData: T) => void;
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
  showItemsButton = false,
  customColumns = [],
  onRowClick,
}: GenericDataTableProps<T>) {
  //🔄 Estado general
  const { state } = useApp();

  //#endregion
  DataTable.use(Buttons);
  const tableRef = useRef<HTMLTableElement>(null);

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

    //#region 🧩 Custom columns (user-defined)

    if (customColumns) {
      cols.push(...customColumns);
    }
    //#endregion
    //#endregion

    //#region 📊 Columna Avance (barra de progreso)
    if (labelMap["avance"]) {
      cols.push({
        title: labelMap["avance"],
        data: null,
        orderable: false,
        searchable: false,
        defaultContent: "",
        render: function (_data, type, row) {
          // ——— Para la exportación (Excel, CSV, Copiar, PDF) ———
          if (type === "export") {
            const nombre = row["avance"] ?? 0;
            // Capitaliza igual que en la badge
            return nombre ?? "";
          }

          // ——— Para los demás usos (“display”, “filter”, “sort”) ———
          if (type === "filter" || type === "sort") {
            return row["avance"] ?? 0;
          }
          // Dejamos vacío porque la celda la pintará `createdCell`
          return "";
        },
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

        /* 1️⃣  Sigue usando null: DataTables enviará la fila completa al render */
        data: null,
        orderable: true,
        searchable: true,
        defaultContent: "",

        /* 2️⃣  NUEVO: render ortogonal */
        render: function (_data, type, row) {
          // ——— Para la exportación (Excel, CSV, Copiar, PDF) ———
          if (type === "export") {
            const nombre = row?.estado?.nombre ?? "";
            // Capitaliza igual que en la badge
            return nombre
              ? nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase()
              : "";
          }

          // ——— Para los demás usos (“display”, “filter”, “sort”) ———
          if (type === "filter" || type === "sort") {
            return row?.estado?.nombre ?? "";
          }
          // Dejamos vacío porque la celda la pintará `createdCell`
          return "";
        },

        /* 3️⃣  SIGUE tu lógica de React en `createdCell` */
        createdCell: (cell, _data, row) => {
          try {
            const estado = (row as any)?.estado?.nombre?.toLowerCase() ?? "N/A";

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

    //#region DetallesJson
  if (labelMap["detalleJSON"]) {
    cols.push({
      title: labelMap["detalleJSON"] ?? "Detalle",
      data: "detalleJSON",
      orderable: true,
      searchable: true,
      className: "text-start",
      defaultContent: "",
      render: function (data, type, row) {
        return formatDetalleJSON(row?.detalleJSON ?? {}, type);
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
      className: "noExport text-center",
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
        deferRender: true,
        destroy: true,
        dom: "Bfrtip",
        // @ts-expect-error  — «title» aún no está en las typings
        buttons: [
          {
            extend: "excelHtml5",
            text: `
          <i class="bi bi-file-earmark-excel-fill fs-4 me-1"></i>
          <span class="d-none d-sm-inline">Exportar Excel</span>
          <i class="bi bi-download fs-5 ms-1"></i>
        `,
            className:
              "btn btn-success btn-sm mb-3 d-flex align-items-center justify-content-center gap-2",
            filename:
              "Reporte " +
              title +
              " " +
              new Date()
                .toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .split("/")
                .join("-"),
            titleAttr: "Descargar como Excel",
            exportOptions: {
              columns: ":visible:not(.noExport)",
              orthogonal: "export",
            },
            title:
              "Negocio: " +
              state.negocio?.nombreNegocio +
              ", Reporte: " +
              title +
              " " +
              new Date()
                .toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .split("/")
                .join("-"),
            sheetName: "Datos",
          },
        ],
      });

      const dtInstance = $(table).DataTable();
      $(table)
        .off("click", "tbody tr")
        .on("click", "tbody tr", function () {
          const row = dtInstance.row(this);
          if (!row.any()) return;
          const rawData = row.data() as T;
          onRowClick?.(rawData); // ✅ envia al componente padre
        });
    } catch (err) {
      console.error("DataTable error", err);
    }
  }, []);
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
