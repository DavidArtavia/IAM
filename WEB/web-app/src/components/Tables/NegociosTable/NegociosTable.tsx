import { useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import { labelMapNegocio } from "@/utils";
import { CoreDataTable } from "@/components";
import { DTO_Negocio } from "@/models";

interface DataTableProps {
  data: DTO_Negocio[];
  onAdd: () => void;
  onEdit: (rowData: DTO_Negocio) => void;
  onDelete: (rowData: DTO_Negocio) => void;
  disableButtonAdd?: boolean;
}
export const NegociosTable = ({
  data,
  onAdd,
  onEdit,
  onDelete,
  disableButtonAdd,
}: DataTableProps) => {
    console.log("NegociosTable data:", data);
    
  const tableRef = useRef<HTMLTableElement>(null);

  // Extrae todas las claves únicas de los objetos dentro de referenciaJSON
  const referenciaKeys = Array.from(
    new Set(
      data.flatMap((row) =>
        Array.isArray(row.referenciaJSON)
          ? (row.referenciaJSON as Array<{ Nombre: string }>).map(
              (item) => item.Nombre
            )
          : []
      )
    )
  );

  const columns = [
    { title: "ID Negocio", data: "iD_Negocio" },
    { title: "ID Usuario", data: "iD_Usuario" },
    { title: "Negocio", data: "nombreNegocio" },
    { title: "Descripción", data: "descripcion" },
    { title: "Dirección", data: "direccion" },
    { title: "Telefono", data: "telefonoNegocio" },
    { title: "Correo", data: "correoNegocio" },
    {
      title: "Fecha Registro",
      data: "fechaRegistro",
      render: (data: string) => new Date(data).toLocaleDateString(),
    },
    {
      title: "Estado",
      data: null,
      render: (_data: unknown, _type: unknown, row: DTO_Negocio) => {
        const isActivo = row.estado?.nombre?.toLowerCase() === "activo";
        const badgeClass = isActivo
          ? "badge badge-light-success"
          : "badge badge-light-primary";
        return `<span class="${badgeClass}">${
          row.estado?.nombre || "N/A"
        }</span>`;
      },
    },
    // Agrega una columna por cada clave encontrada en referenciaJSON
    ...referenciaKeys.map((key) => ({
      title: key,
      data: "referenciaJSON",
      render: (data: Array<{ Nombre: string; Valor: string }>) => {
        if (!Array.isArray(data)) return "";
        const found = data.find((item) => item.Nombre === key);
        return found ? found.Valor : "";
      },
    })),
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
    <CoreDataTable<DTO_Negocio>
      title="Negocios Registrados"
      data={data}
      handleAdd={onAdd}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      disabeldButtonAdd={disableButtonAdd}
      labelMap={labelMapNegocio}
    />
  );
};
