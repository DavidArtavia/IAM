import { IProps } from "../../types/IProps"

export const Login = ({}: IProps) => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Iniciar Sesión</h2>
      <p>Página de login para la app del taller </p>
      <h5>Building...</h5>
      <button onClick={() => window.location.href = "/home"}>Ir a Home</button>
    </div>
  );
}