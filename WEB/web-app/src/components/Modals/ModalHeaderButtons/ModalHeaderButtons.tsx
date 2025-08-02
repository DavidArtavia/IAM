
export type DynamicButtonConfig = {
  titulo?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick: (data?: any) => void;
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
          className={`btn btn-sm ms-2 me-2 ${
            btn.className ? btn.className : "btn-primary"
          }`}
          disabled={btn.disabled}
        >
          {btn.titulo}
          {btn.icon}
        </button>
      ))}
    </div>
  );
};
