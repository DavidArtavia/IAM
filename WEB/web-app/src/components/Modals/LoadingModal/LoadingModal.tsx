interface LoadingModalProps {
    loadingMessage?: string;
}

export const LoadingModal = ({ loadingMessage }: LoadingModalProps) => {
  return (
<div>poner acá el spinner de cargando del tempate y validarlo con este parametro {loadingMessage} </div>
  );
};
