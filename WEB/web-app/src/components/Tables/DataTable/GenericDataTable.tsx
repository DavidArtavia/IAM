import React, { useEffect, useRef, useMemo } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import 'datatables.net-responsive-bs5';
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css';
import DataTable from "datatables.net-dt";
import JsZip from "jszip";
import Buttons from "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.html5.js";
import 'datatables.net-fixedheader-bs5';
import 'datatables.net-fixedheader-bs5/css/fixedHeader.bootstrap5.min.css';

import ReactDOM from "react-dom/client";
import { useApp } from "@/hooks/useApp";
import { ActionButtons, DynamicButtonConfig } from "@/components";

type ColumnSettings = DataTables.ColumnSettings;

declare global {
  interface Window {
    JSZip: typeof JsZip;
  }
}

window.JSZip = JsZip;

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
  customColumns?: ColumnSettings[];
  dataTableButtons?: DynamicButtonConfig[];
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
  disableButtonAdd = false,
  customRenderers = {},
  includeEstadoColumn = false,
  customColumns = [],
  dataTableButtons,
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
        orderable: true,
        searchable: true,
        defaultContent: "",
        render: function (_data, type, row) {
          const porcentaje = row["avance"] ?? 0;

          // Exportaciones (Excel, PDF, etc.)
          if (type === "export") {
            return `${porcentaje}%`;
          }

          // Filtros y ordenamientos
          if (type === "filter" || type === "sort") {
            return porcentaje;
          }
          // Display: se renderiza manualmente en `createdCell`
          return "";
        },
        createdCell: (cell, _cellData, row) => {
          try {
            const porcentaje = row["avance"] ?? 0;
            const barColor =
              porcentaje >= 80
                ? "bg-success"
                : porcentaje >= 50
                  ? "bg-warning"
                  : "bg-danger";

            const container = document.createElement("div");
            (cell as HTMLElement).innerHTML = "";
            cell.appendChild(container);

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
                  />
                </div>
              </div>
            );

            ReactDOM.createRoot(container).render(content);
          } catch (error) {
            console.warn("Error renderizando columna 'avance'", error);
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
              dataTableButtons={dataTableButtons}
            />
          );
        } catch (err) {
          console.warn("Error render actions", err);
        }
      },
    });
    //#endregion

    if (cols.length > 0) {
      const lastIdx = cols.length - 1;

      // Primera columna: máxima prioridad (se queda visible)
      // @ts-expect-error  — por el uso de la librerí a con react
      cols[0] = { ...cols[0], responsivePriority: 1 };

      // Última columna: segunda prioridad (se queda visible si hay espacio)
      // @ts-expect-error  — por el uso de la librerí a con react
      cols[lastIdx] = { ...cols[lastIdx], responsivePriority: 2 };

      // Asignar prioridades crecientes al resto (preserva orden)
      for (let i = 1; i < lastIdx; i++) {
        // prioridad más alta numérica = se oculta antes
        // @ts-expect-error  — por el uso de la librerí a con react
        cols[i] = { ...cols[i], responsivePriority: 3 + i };
      }
    }

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

    const headerOffset = document.querySelector<HTMLElement>('.navbar, .app-navbar, .header')?.offsetHeight ?? 0;

    try {
      const dtInstance = $(table).DataTable({
        data,
        // @ts-expect-error  — «title» aún no está en las typings
        fixedHeader: {
          header: true,
          headerOffset, // pon 0 si no tienes barra fija
        },
        columns: dtColumns,
        responsive: true,
        autoWidth: false, // ✅ evita cálculos innecesarios
        columnDefs: [
          { targets: "_all", className: "text-center", defaultContent: "" },
        ],
        order: [[0, "desc"]],
        searchDelay: 200,
        processing: true,
        language: {
          search: "",
          searchPlaceholder: "Buscar…",    // <- placeholder en el input
          emptyTable: "No hay datos disponibles",
          lengthMenu: '<span class="d-none d-sm-inline">Mostrar</span> _MENU_ <span class="d-none d-sm-inline">registros</span>',
          zeroRecords: "No se encontraron resultados",
          info: "Mostrando página _PAGE_ de _PAGES_",
          infoEmpty: "Sin registros",
          infoFiltered: " (filtrado de _MAX_ registros totales)",
          paginate: {
            first: "Primero",
            last: "Último",
            previous: "Anterior",
            next: "Siguiente",
          }
        },
        deferRender: true,
        destroy: true,
        dom:
          "<'dt-toolbar d-flex flex-wrap align-items-center gap-2 px-2'<'me-auto'l><'ms-auto d-flex align-items-center flex-wrap gap-2'Bf>>" +
          "rt" +
          "<'dt-footer row gy-2 gx-2 align-items-center justify-content-center justify-content-md-between px-2'" +
          "<'col-12 col-md-auto order-2 order-md-1 text-center text-md-start'i>" +
          "<'col-12 col-md-auto order-1 order-md-2 text-center text-md-end ms-md-auto'p>" +
          ">",

        pageLength: 50,                // ✅ 50 por defecto
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Todos"]],
        buttons: [
          {
            extend: "excelHtml5",
            text: `
  <i class="bi bi-download fs-5 d-inline d-sm-none" aria-hidden="true"></i>
  <span class="visually-hidden d-inline d-sm-none">Exportar Excel</span>
  <span class="d-none d-sm-inline">Exportar Excel</span>
`,
            className:
              "btn btn-success btn-sm mb-0 d-flex align-items-center justify-content-center gap-2",
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
      // 🎨 Estilos para el bloque "info" (DT2: .dt-info / DT1: .dataTables_info)
      const styleInfo = () => {
        const $wrapper = $(table).closest('.dt-container, .dataTables_wrapper');
        const $info = $wrapper.find('.dt-info, .dataTables_info');
        $info.css({ color: '#b5b5c3', padding: '5px' });
      };
      styleInfo();
      // Reaplicar en redraw / cambio de página / longitud
      $(table)
        .off('draw.dt._styleInfo page.dt._styleInfo length.dt._styleInfo')
        .on('draw.dt._styleInfo page.dt._styleInfo length.dt._styleInfo', styleInfo);

      // 🎨 Estilo para el footer (margen superior de 10px)
      const styleFooter = () => {
        const $wrapper = $(table).closest('.dt-container, .dataTables_wrapper');
        $wrapper.find('.dt-footer').css({ marginTop: '15px' });
      };
      styleFooter();
      // Reaplicar en redraw / cambio de página / cambio de longitud
      $(table)
        .off('draw.dt._styleFooter page.dt._styleFooter length.dt._styleFooter')
        .on('draw.dt._styleFooter page.dt._styleFooter length.dt._styleFooter', styleFooter);

      // 🔤 Forzar etiqueta "Todos" en la opción -1 del selector de longitud
      const fixAllLabel = () => {
        const $wrapper = $(table).closest('.dt-container, .dataTables_wrapper');
        // Soporta DT v2 (.dt-length) y v1 (.dataTables_length)
        const $select = $wrapper.find('.dt-length select, .dataTables_length select');
        $select.find('option[value="-1"]').text('Todos');
      };
      fixAllLabel();

      // Reaplicar por si el DOM se re-renderiza o cambia la longitud/página
      $(table)
        .off('init.dt._fixAll length.dt._fixAll draw.dt._fixAll')
        .on('init.dt._fixAll length.dt._fixAll draw.dt._fixAll', fixAllLabel);

      // 🎨 Separación del panel superior (toolbar) respecto a la tabla (15px)
      const styleToolbar = () => {
        const $wrapper = $(table).closest('.dt-container, .dataTables_wrapper');
        $wrapper.find('.dt-toolbar').css({ marginBottom: '15px' });
      };
      styleToolbar();
      // Reaplicar en redraw / cambio de página / cambio de longitud
      $(table)
        .off('draw.dt._styleToolbar page.dt._styleToolbar length.dt._styleToolbar')
        .on('draw.dt._styleToolbar page.dt._styleToolbar length.dt._styleToolbar', styleToolbar);


      // Click fila
      $(table)
        .off("click", "tbody tr")
        .on("click", "tbody tr", function () {
          const row = dtInstance.row(this);
          if (!row.any()) return;
          const rawData = row.data() as T;
          onRowClick?.(rawData); // ✅ envia al componente padre
        });

      // ✅ Nunca ocultar 1.ª y última columna en casos extremos
      $(table)
        .off('responsive-resize.dt._keepEnds')
        .on('responsive-resize.dt._keepEnds', function () {
          const n = dtInstance.columns().count();
          if (n > 1) {
            dtInstance.column(0).visible(true);
            dtInstance.column(n - 1).visible(true);
          }
        });

      // ✅ Auto-ajuste al mostrar tabs / modals (BS5)
      const adjust = () => {
        dtInstance.columns.adjust();
        // @ts-expect-error  — por el uso de la librerí a con react
        dtInstance.fixedHeader?.adjust?.();
        // @ts-expect-error  — por el uso de la librerí a con react
        dtInstance.responsive.recalc();
      };
      $(document)
        .off('shown.bs.tab.dtfix shown.bs.modal.dtfix')
        .on('shown.bs.tab.dtfix shown.bs.modal.dtfix', adjust);

      // Ajuste inicial por si el contenedor aparece luego (tabs, accordions)
      setTimeout(adjust, 0);



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
      // Ajustes tras redibujar (por si cambia ancho)
      dtInstance.columns.adjust();
      // @ts-expect-error  — por el uso de la librerí a con react
      dtInstance.fixedHeader?.adjust?.();
      // @ts-expect-error  — por el uso de la librerí a con react
      dtInstance.responsive.recalc();

    } catch (err) {
      console.warn("Data update error", err);
    }
  }, [data]);
  //#endregion

  //#region 🎨 Render
  return (
    <>
      <div className="card mt-5">
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
