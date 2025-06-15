export interface RefItem {
  nombre: string;
  valor: string;
}

interface Props {
  items: RefItem[];
}

export const ReferenciaCards = ({ items }: Props) => {
  if (items.length === 0) {
    return <span className="text-muted">[Sin referencias]</span>;
  }
  return (
    // Flex wrap para que las tarjetas se ajusten y gap-1 para separación mínima
    <div className="d-flex flex-wrap gap-1 p-2">
      {items.map((ref, i) => (
        <div key={i} className="badge badge-light-primary p-2">
          <div className="fs-8 text-muted fw-bold">{ref.nombre}:</div>
          <div className="fs-8 ">{ref.valor || ""}</div>
        </div>
      ))}
    </div>
  );
};
