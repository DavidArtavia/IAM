import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useMemo, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import DataTable from 'datatables.net-dt';
import JsZip from 'jszip';
import Buttons from 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.html5.js';
import ReactDOM from "react-dom/client";
import { InfoModal, ActionButtons, ReferenciaCards } from "@/components";
import { useApp } from "@/hooks/useApp";
//@ts-expect-error -Error ignorado
window.JSZip = JsZip;
export function GenericDataTable({ title, columnKeys, labelMap, data, onAdd, onEdit, onDelete, onOpenItemsModal, disableButtonAdd = false, customRenderers = {}, includeEstadoColumn = false, includeReferenceColumn = false, modalInfoFields, showItemsButton = false, datekeys, }) {
    //🔄 Estado general
    const { state } = useApp();
    //#endregion
    DataTable.use(Buttons);
    const tableRef = useRef(null);
    const [showInfo, setShowInfo] = useState(false);
    const [detailData, setDetailData] = useState({});
    //#region 🔧 Columnas dinámicas DataTable
    const dtColumns = useMemo(() => {
        const cols = [];
        const availableKeys = data.reduce((set, row) => {
            Object.keys(row).forEach((k) => set.add(k));
            return set;
        }, new Set());
        columnKeys.forEach((key) => {
            const keyStr = String(key);
            if (data.length === 0 || availableKeys.has(keyStr)) {
                const col = {
                    title: labelMap[keyStr] || keyStr,
                    data: keyStr,
                    defaultContent: "",
                };
                if (customRenderers[key]) {
                    col.render = (val, _, row) => {
                        try {
                            return customRenderers[key](val, row);
                        }
                        catch (error) {
                            console.warn(`Render error (${keyStr})`, error);
                            return val || "";
                        }
                    };
                }
                cols.push(col);
            }
        });
        function parametrosAString(lista) {
            if (!Array.isArray(lista) || lista.length === 0)
                return '';
            return lista
                .map(({ nombre = '', valor = '' }) => {
                // 1️⃣ trim → fuera espacios a los dos lados
                const nom = nombre.trim();
                const val = valor.trim();
                // 2️⃣ capitaliza: 1ª letra mayúscula + resto minúsculas
                const nomCap = nom
                    ? nom[0].toUpperCase() + nom.slice(1).toLowerCase()
                    : '';
                return `${nomCap}: ${val}`;
            })
                .join(', ');
        }
        //#region 🧷 Columna Referencias JSON
        if (includeReferenceColumn && labelMap["referenciaJSON"]) {
            cols.push({
                title: labelMap["referenciaJSON"],
                data: null,
                orderable: true,
                searchable: true,
                defaultContent: "",
                render: function (_data, type, row) {
                    // ——— Para la exportación (Excel, CSV, Copiar, PDF) ———
                    if (type === "export") {
                        const nombre = parametrosAString(row.referenciaJSON) ?? "";
                        // Capitaliza igual que en la badge
                        return nombre ?? "";
                    }
                    // ——— Para los demás usos (“display”, “filter”, “sort”) ———
                    if (type === "filter" || type === "sort") {
                        return parametrosAString(row.referenciaJSON) ?? "";
                    }
                    // Dejamos vacío porque la celda la pintará `createdCell`
                    return "";
                },
                createdCell: (cell, _, row) => {
                    try {
                        const container = document.createElement("div");
                        cell.innerHTML = "";
                        cell.appendChild(container);
                        ReactDOM.createRoot(container).render(_jsx(ReferenciaCards, { items: row.referenciaJSON || [] }));
                    }
                    catch (err) {
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
                        cell.innerHTML = "";
                        cell.appendChild(container);
                        const porcentaje = row["avance"] ?? 0;
                        const barColor = porcentaje >= 80
                            ? "bg-success"
                            : porcentaje >= 50
                                ? "bg-warning"
                                : "bg-danger";
                        const content = (_jsxs("div", { className: "d-flex flex-column w-100 me-2", children: [_jsx("div", { className: "d-flex flex-stack mb-2", children: _jsxs("span", { className: "text-muted me-2 fs-7 fw-bold", children: [porcentaje, "%"] }) }), _jsx("div", { className: "progress h-6px w-100", children: _jsx("div", { className: `progress-bar ${barColor}`, role: "progressbar", style: { width: `${porcentaje}%` }, "aria-valuenow": porcentaje, "aria-valuemin": 0, "aria-valuemax": 100 }) })] }));
                        ReactDOM.createRoot(container).render(content);
                    }
                    catch (error) {
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
                        const estado = row?.estado?.nombre?.toLowerCase() ?? "N/A";
                        const badgeClassMap = {
                            activo: "badge-light-success",
                            nuevo: "badge badge-secondary",
                            "en proceso": "badge-light-primary",
                            "en espera": "badge-light-warning",
                            completado: "badge-light-success",
                            eliminado: "badge-light-danger",
                            inactivo: "badge-light-light",
                            default: "badge badge-dark",
                        };
                        const badgeClass = badgeClassMap[estado] || badgeClassMap["default"];
                        const container = document.createElement("span");
                        cell.innerHTML = "";
                        cell.appendChild(container);
                        ReactDOM.createRoot(container).render(_jsx("span", { className: `badge ${badgeClass}`, children: estado.charAt(0).toUpperCase() + estado.slice(1) }));
                    }
                    catch (err) {
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
            className: 'noExport text-center',
            createdCell: (cell, _, row) => {
                try {
                    const container = document.createElement("div");
                    cell.innerHTML = "";
                    cell.appendChild(container);
                    ReactDOM.createRoot(container).render(_jsx(ActionButtons, { rowData: row, onEdit: () => onEdit(row), onDelete: () => onDelete(row), showItemsButton: showItemsButton, onOpenModal: () => onOpenItemsModal?.(row) }));
                }
                catch (err) {
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
        if (!table || dtColumns.length === 0)
            return;
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
                dom: 'Bfrtip',
                // @ts-expect-error  — «title» aún no está en las typings
                buttons: [{
                        extend: 'excelHtml5',
                        text: '<i class="bi bi-file-earmark-excel-fill me-1 fs-1"></i> Exportar a Excel',
                        className: 'btn btn-success',
                        filename: 'Reporte ' + title + ' ' + new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-'),
                        titleAttr: 'Descargar como Excel',
                        exportOptions: { columns: ':visible:not(.noExport)', orthogonal: 'export' }, // nada más
                        title: 'Negocio: ' + state.negocio?.nombreNegocio + ', Reporte: ' + title + ' ' + new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-'),
                        sheetName: 'Datos',
                    }]
            });
            const dtInstance = $(table).DataTable();
            $(table)
                .off("click", "tbody tr")
                .on("click", "tbody tr", function () {
                const row = dtInstance.row(this);
                if (!row.any())
                    return;
                const rawData = row.data();
                const detail = modalInfoFields
                    ? modalInfoFields.reduce((acc, key) => {
                        acc[String(key)] = rawData[key];
                        return acc;
                    }, {})
                    : rawData;
                setDetailData(detail);
                setShowInfo(true);
            });
        }
        catch (err) {
            console.error("DataTable error", err);
        }
        //David, este parámetro dtColumns es el que hace brincar la tabla
    }, [dtColumns, modalInfoFields]);
    //#endregion
    //#region 🔁 Actualización de datos al cambiar props
    useEffect(() => {
        const table = tableRef.current;
        if (!table || !$.fn.dataTable.isDataTable(table))
            return;
        try {
            const dtInstance = $(table).DataTable();
            dtInstance.clear().rows.add(data).draw();
        }
        catch (err) {
            console.warn("Data update error", err);
        }
    }, [data]);
    //#endregion
    //#region 🎨 Render
    return (_jsxs(_Fragment, { children: [_jsx(InfoModal, { show: showInfo, onHide: () => setShowInfo(false), data: detailData, labelMap: labelMap, dateKeys: datekeys }), _jsxs("div", { className: "card shadow-sm mt-5", children: [_jsxs("div", { className: "card-header d-flex justify-content-between align-items-center py-10 px-lg-17", children: [_jsx("h3", { className: "card-title text-gray-600", children: title }), _jsx("button", { onClick: onAdd, className: "btn btn-primary", disabled: disableButtonAdd, children: "Agregar" })] }), _jsx("div", { className: "card-body table-responsive p-2 py-10 px-lg-17", children: _jsx("table", { ref: tableRef, className: "table table-sm table-striped table-hover align-middle text-center w-auto" }) })] })] }));
    //#endregion
}
