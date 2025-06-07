// src/components/GenericDataTable.tsx
import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import ReactDOM from "react-dom/client";
import { InfoModal, ActionButtons } from "@/components";

type ColumnSettings = DataTables.ColumnSettings;

// Interface de props para la tabla genérica
export interface GenericDataTableProps<T> {
  title: string;
  /**
   * Arreglo de cadenas que corresponden a las llaves de cada objeto T a mostrar.
   * Ej: ["iD_CuentasPorPagar", "iD_Negocio", "concepto", ...]
   */
  columnKeys: (keyof T)[];
  /**
   * Mapa { clave → etiqueta } para mostrar en el encabezado.
   * Ej: { iD_CuentasPorPagar: "ID Cuenta por Pagar", concepto: "Concepto", ... }
   */
  labelMap: Record<string, string>;
  /**
   * Lista de filas (objetos) que se van a pasar a DataTables.
   */
  data: T[];
  /**
   * Callback para cuando el usuario haga clic en “Agregar”.
   */
  onAdd: () => void;
  /**
   * Callback para cuando el usuario presione el botón “Editar” de una fila.
   * Se le pasa el objeto completo de esa fila.
   */
  onEdit: (rowData: T) => void;
  /**
   * Callback para cuando el usuario presione el botón “Eliminar” de una fila.
   */
  onDelete: (rowData: T) => void;
  /**
   * Si se quiere inhabilitar el botón “Agregar” desde afuera.
   */
  disableButtonAdd?: boolean;
  /**
   * Mapa opcional de funciones de renderizado específico para ciertos campos.
   * Clave: nombre de la propiedad (cadena); Valor: función de renderizado.
   * Por ejemplo, para formatear “saldo” o para formatear fechas:
   * {
   *   saldo: (monto: number) => formatNumber(monto),
   *   fechaInicial: (fechaStr: string) => new Date(fechaStr).toLocaleDateString(),
   * }
   */
  customRenderers?: {
    [K in keyof T]?: (
      value: unknown,
      rowData: T
    ) => string | number | React.ReactNode;
  };
  /**
   * Opcional: Para que se muestre la columna “Estado”
   * (previo a que se definas en columnKeys),
   * tu objeto T debe tener la propiedad “estado” de la forma { nombre: string }.
   */
  includeEstadoColumn?: boolean;
}

export function GenericDataTable<T,>({
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
}: GenericDataTableProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null);
  // Modal “ver detalles” al hacer clic en fila
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedData, setSelectedData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!tableRef.current) return;

    // Si ya estaba inicializada, destruirla antes de reconstruir
    if ($.fn.dataTable.isDataTable(tableRef.current)) {
      const instance = $(tableRef.current).DataTable();
      instance.clear().destroy();
      // DataTables a veces deja nodos residuales, limpiamos:
      $(tableRef.current).empty();
    }

    // 1) Construimos un arreglo mutable de ColumnSettings<T>
    const dtColumns: ColumnSettings[] = [];

    // 1.a) Primero, las columnas que vienen en columnKeys
    columnKeys.forEach((key) => {
      const col: ColumnSettings = {
        title: labelMap[key as string] || String(key),
        data: String(key),
      };

      // Si hay un customRenderer para esta clave, lo usamos en `render`
      if (customRenderers[key]) {
        col.render = (cellValue: unknown, _type: unknown, rowData: T) => {
          // Lo que devuelva el renderer puede ser string|number|React.ReactNode
          const rendered = customRenderers[key]!(cellValue, rowData);
          // Si viene ReactNode, lo envolvemos en string de HTML con un contenedor
          if (React.isValidElement(rendered)) {
            // Convertir ReactNode a HTML string no es trivial; en su lugar,
            // montaremos con `createdCell` más abajo.
            // Para simplificar, aquí lo convertiremos a String() o a Number().
            return String(rendered);
          } else {
            return rendered;
          }
        };
        // NOTA: si planificas usar ReactNode puro, es mejor no definirlo aquí sino
        // usar `createdCell`, como lo hacemos con “Estado” o “Acciones”.
      }

      // Caso “saldo” específico: si no definiste customRenderers, puedes optar
      // por detectar clave “saldo” y aplicar `$.fn.dataTable.render.number(...)`:
      if (key === ("saldo" as keyof T) && !customRenderers[key]) {
        col.render = $.fn.dataTable.render.number(",", ".", 2, "₡") as DataTables.FunctionColumnRender;
      }

      // Caso “fechaInicial” / “fechaModificacion”: formatear fecha:
      if (
        (key === ("fechaInicial" as keyof T) ||
          key === ("fechaModificacion" as keyof T)) &&
        !customRenderers[key]
      ) {
        col.render = (fechaStr: unknown) => {
          if (!fechaStr) return "";
          const date = new Date(String(fechaStr));
          return date.toLocaleDateString();
        };
      }

      dtColumns.push(col);
    });

    // 1.b) Si queremos incluir “Estado” en la propia tabla:
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
          const estado = (rowData as T & { estado?: { nombre?: string } }).estado;
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

    // 1.c) La columna de “Acciones” siempre va al final
    const actionRoots: ReactDOM.Root[] = [];
    dtColumns.push({
      title: "Acciones",
      data: null,
      orderable: false,
      searchable: false,
      defaultContent: "<div></div>",
      createdCell: (cell: Node, _cellData: unknown, rowData: T) => {
        const td = cell as HTMLTableCellElement;
        td.innerHTML = "";
        const root = ReactDOM.createRoot(td);
        actionRoots.push(root);
        root.render(
          <ActionButtons
            rowData={rowData}
            onEdit={() => onEdit(rowData)}
            onDelete={() => onDelete(rowData)}
          />
        );
      },
    });

    // 2) Inicializamos DataTable con esas columnas dinámicas
    const table = $(tableRef.current).DataTable({
      data,
      columns: dtColumns,
      columnDefs: [{ targets: "_all", className: "text-center" }],
      order: [[0, "desc"]], // ordenar por primera columna descendente
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

    // 3) Captura un “click” en cualquier <tr> para abrir el InfoModal
    $(tableRef.current).off("click", "tbody tr");
    $(tableRef.current).on("click", "tbody tr", function () {
      const row = table.row(this);
      if (row.any()) {
        const rowData = row.data() as T;
        setSelectedData(rowData as unknown as Record<string, unknown>);
        setShowInfoModal(true);
      }
    });

    // 4) Cleanup: destruir DataTable y desmontar todos los roots de React
    return () => {
      table.destroy();
      setTimeout(() => {
        actionRoots.forEach((r) => r.unmount());
      }, 0);
    };
  }, [data]);

  return (
    <>
      {/* InfoModal: muestra detalles de la fila si el usuario hace clic en <tr> */}
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
              disabled={disableButtonAdd}
              onClick={onAdd}
              className="btn btn-primary"
            >
              Agregar
            </button>
          </div>
          <div className="card-body table-responsive">
            <table
              className="table table-responsive table-hover align-middle text-center"
              ref={tableRef}
            />
          </div>
        </div>
      </div>
    </>
  );
}
