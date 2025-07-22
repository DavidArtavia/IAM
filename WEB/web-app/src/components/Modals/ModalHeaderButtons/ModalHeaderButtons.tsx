
export type DynamicButtonConfig = {
  titulo: string;
  className?: string;
  onClick: () => void;
};

interface Props {
  buttons: DynamicButtonConfig[];
  containerClassName?: string;
}

export const ModalHeaderButtons = ({
  buttons,
  containerClassName = "ms-auto d-flex",
}: Props) => {
  return (
    <div className={containerClassName}>
      {buttons.map((btn, index) => (
        <button
          key={`dynamic-btn-${index}`}
          onClick={btn.onClick}
          className={`btn btn-sm me-2 ${btn.className ? btn.className : "btn-primary"}`}
          disabled={(btn as any).disabled}
        >
          {btn.titulo}
          {(btn as any).icon}
        </button>
      ))}
    </div>
  );
};
