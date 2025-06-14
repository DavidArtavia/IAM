interface InfoPanelProps {
  msj?: string;
}

export const InfoPanel = ({ msj }: InfoPanelProps) => {
  return (
    <>
      <div className="card shadow-sm mt-5">
        <div className="card-header">
          <span className="card-title text-gray-600">Información</span>
        </div>
        <div className="card-body d-flex flex-column align-items-center">
          <p className="text-muted">{msj}</p>
        </div>
      </div>
    </>
  );
};
