
import { DTO_ItemOrdenServicio, DTO_OrdenServicio } from "@/models";
import { OrdenServicioCard } from "./OrdenServicioCard";

interface Props {
  titulo: string;
  colorBarra: string;
  estado: number;
  ordenes: DTO_OrdenServicio[];
  items: DTO_ItemOrdenServicio[];
  onAvanceChange: (item: DTO_ItemOrdenServicio, checked: boolean) => void;
  onEstadoChange: (orden: DTO_OrdenServicio, nuevoEstado: number) => void;
  onClickCreateCount?: (countSelected: DTO_OrdenServicio) => void;
}

export const OrdenesSeccion = ({
  titulo,
  colorBarra,
  estado,
  ordenes,
  items,
  onAvanceChange,
  onEstadoChange,
  onClickCreateCount, // Placeholder for future use
}: Props) => {
  const ordenesFiltradas = ordenes.filter((o) => o.estado.iD_Estado === estado);

  return (
    <div className="col-md-3 col-lg-12 col-xl-3">
      <div className="mb-9">
        <div className="d-flex flex-stack">
          <div className="fw-bolder fs-4">
            {titulo}
            <span className="fs-6 text-gray-400 ms-2">
              {ordenesFiltradas.length}
            </span>
          </div>
        </div>
        <div className={`h-3px w-100 ${colorBarra}`}></div>
      </div>

      {ordenesFiltradas.map((orden) => (
        <OrdenServicioCard
          key={orden.iD_OrdenServicio}
          orden={orden}
          items={items.filter(
            (i) => i.iD_OrdenServicio === orden.iD_OrdenServicio
          )}
          onAvanceChange={onAvanceChange}
          onEstadoChange={onEstadoChange}
          onClickCreateCount={onClickCreateCount} 
        />
      ))}
    </div>
  );
};
