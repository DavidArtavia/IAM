import { usuarioValidator } from "@/validators/usuarioValidator";
import { usuarioService } from "@/services/usuario.service";
import { errorHelpers, notificationHelpers } from "@/utils"
import { Link, useNavigate } from "react-router-dom";
import { DTO_Respuesta, DTO_Usuario } from "@/models";
import { ROUTES } from "@/constants";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

export const Login = () => {
  //useContext/useStates
  const [usuario, setUsuario] =  useState<DTO_Usuario | null>(new DTO_Usuario());;
  const [cargando, setCargando] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  //Eventos
    const handleOnClick = () => { validarDatosLogin() }

  //Métodos
  const validarDatosLogin = () => {
    if (usuarioValidator.validarDatosLogin(usuario)) {
      autenticarUsuario()
    }
  }

  const autenticarUsuario = () => {
    setCargando(true);
    usuarioService.autenticarUsuario(usuario).subscribe({
      next: (result) => procesarRespuesta(result as DTO_Respuesta),
      error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
      complete: () => { setCargando(false); }
    });

  }

  // actualiza sólo el campo dinámicamente
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUsuario((prev) =>
      prev
        ? { ...prev, [name]: value }         
        : null
    );
  };

  const procesarRespuesta = (respuesta: DTO_Respuesta) => {
    if (respuesta.tipoRespuesta) {
      const user = respuesta.resultado[0] as DTO_Usuario
      //@ts-expect-error - Aqui se obtiene el token 
       const accesToken = respuesta.resultado[1].accesToken;
       localStorage.setItem("accesToken", accesToken);
       setUsuario(user);
       login(user, accesToken);
      
      
      notificationHelpers.successAlert(`Hola ${user.nombreUsuario + " " + user.apellido}, bienvenido de nuevo 👋`)
      const lastPath = localStorage.getItem("lastPath") || ROUTES.HOME;
      setTimeout(() => {
        navigate(lastPath, { replace: true });
      }, 200);
      
    } else {
      //Controlamos el error del sistema
      errorHelpers.systemError(respuesta);
    }
  }

  return (
    <div className="d-flex flex-column flex-root">
      <div
        className="d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed"
        style={{
          backgroundImage:
            'url("src/assets/media/illustrations/sketchy-1/14.png")',
        }}
      >
        <div className="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
          <a className="mb-12">
            <img
              alt="Logo"
              src="src/assets/media/logos/logo-1.svg"
              className="h-40px"
            />
          </a>

          <div className="w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto">
            <form
              className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
              noValidate
              id="kt_sign_in_form"

            >
              <div className="text-center mb-10">
                <h1 className="text-dark mb-3">Iniciar Sesión</h1>

                <div className="text-gray-400 fw-bold fs-4">

                  <Link to={ROUTES.SIGNUP} className="link-primary fw-bolder">
                    Crear una cuenta
                  </Link>
                </div>
              </div>

              <div className="fv-row mb-10 fv-plugins-icon-container">
                <label className="form-label fs-6 fw-bolder text-dark">
                  Email
                </label>
                <input
                  value={usuario?.correoUsuario}
                  onChange={handleChange}
                  className="form-control form-control-lg form-control-solid"
                  type="text"
                  name="correoUsuario"
                  autoComplete="off"
                  placeholder="ejemplo@gmail.com"
                />
                <div className="fv-plugins-message-container invalid-feedback" />
              </div>

              <div className="fv-row mb-10 fv-plugins-icon-container">
                <div className="d-flex flex-stack mb-2">
                  <label className="form-label fw-bolder text-dark fs-6 mb-0">
                    Password
                  </label>
                </div>
                <input
                  value={usuario?.pass}
                  onChange={handleChange}
                  className="form-control form-control-lg form-control-solid"
                  type="password"
                  name="pass"
                  autoComplete="off"
                />
                <div className="fv-plugins-message-container invalid-feedback" />
              </div>

              <div className="text-center">

              </div>
            </form>
            <button
              id="kt_sign_in_submit"
              className="btn btn-lg btn-primary w-100 mb-5"
              onClick={handleOnClick}
              data-kt-indicator={cargando ? "on" : "off"}
            >
              <span className="indicator-label">Continuar</span>
              <span className="indicator-progress">
                Por favor espere…
                <span className="spinner-border spinner-border-sm align-middle ms-2" />
              </span>
            </button>
          </div>
        </div>

        <div className="d-flex flex-center flex-column-auto p-10">
          <div className="d-flex align-items-center fw-bold fs-6" />
        </div>
      </div>
    </div>
  );
};

export default Login;