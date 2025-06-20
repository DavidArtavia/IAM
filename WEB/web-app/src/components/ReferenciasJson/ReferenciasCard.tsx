export interface RefItem {
  nombre: string;
  valor: string;
}

interface Props {
  items: RefItem[];
}

export const ReferenciaCards = ({ items }: Props) => {
  if (items.length === 0) {
    return <span className="text-muted small">[Sin referencias]</span>;
  }
  return (
    <div
     
      className="d-flex flex-wrap gap-2 p-1"
    >
      {items.map((ref, i) => (
        <div
          key={i}
          style={{
            fontSize: "0.85rem",
            minHeight: "1.8em",
            maxWidth: "100%",
            whiteSpace: "nowrap",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-color)",
            borderRadius: "8px",
            padding: "0.5em 1em",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "0.5em",
            border: "1px solid var(--bs-border-color, #e0e0e0)",
            marginBottom: "2px",
        }}
        >
          <span className="text-primary fw-semibold">{ref.nombre}:</span>
          <span className="text-dark">{ref.valor || ""}</span>
        </div>
      ))}
    </div>
  );
};
