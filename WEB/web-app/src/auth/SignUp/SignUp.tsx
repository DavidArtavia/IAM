import { usuarioValidator } from "@/validators/usuarioValidator";
import { usuarioService } from "@/services/usuario.service";
import { DTO_Respuesta, DTO_Usuario } from "@/models";
import { errorHelpers, notificationHelpers } from "@/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";

export const SignUp = () => {
  //useContext/useStates
const [usuario, setUsuario] =  useState<DTO_Usuario | null>(new DTO_Usuario());;
  const [cargando, setCargando] = useState<boolean>(false);
  const [showPass, setshowPass] = useState<boolean>(false);
  const [confirmacionPass, setconfirmacionPass] = useState<string>("");
  //Eventos
  const handleOnClick = () => { validarDatosRegistroUsuario() }

  //Métodos
  const validarDatosRegistroUsuario = () => {
    if (usuarioValidator.validarDatosRegistroUsuario(usuario, confirmacionPass)) {
      registrarUsuario()
    }
  }

  const registrarUsuario = () => {
    setCargando(true);
    usuarioService.registrarUsuario(usuario).subscribe({
      next: (result) => procesarRespuesta(result as DTO_Respuesta),
      error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
      complete: () => { setCargando(false); }
    });
  }

  const procesarRespuesta = (respuesta: DTO_Respuesta) => {
    if (respuesta.tipoRespuesta) {
      notificationHelpers.successAlert(respuesta.mensaje)
      
    } else {
      //Controlamos el error del sistema
      errorHelpers.systemError(respuesta);
    }
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

  return (
    <div className="d-flex flex-column flex-root">
      <div
        className="d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed"
        style={{
          backgroundImage:
            'url("src/assets/media/illustrations/unitedpalms-1/14-1.png")',
        }}
      >
        <div className="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
          <a href="../../demo6/dist/index.html" className="mb-12">
            <img
              alt="Logo"
              src="src/assets/media/logos/logo-1.svg"
              className="h-40px"
            />
          </a>

          <div className="w-lg-600px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto">
            <form
              className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
              noValidate
              id="kt_sign_up_form"
            >
              <div className="mb-10 text-center">
                <h1 className="text-dark mb-3">Crear cuenta</h1>

                <div className="text-gray-400 fw-bold fs-4">
                  Ya tienes una cuenta?
                  <Link to={ROUTES.LOGIN} className="link-primary fw-bolder">
                    Iniciar sesión
                  </Link>

                </div>
              </div>

              <div className="row fv-row mb-7 fv-plugins-icon-container">
                <div className="col-xl-6">
                  <label className="form-label fw-bolder text-dark fs-6">
                    Nombre
                  </label>
                  <input
                  
                    value={usuario?.nombreUsuario}
                    onChange={handleChange}
                    className="form-control form-control-lg form-control-solid"
                    type="text"
                    name="nombreUsuario"
                    autoComplete="off"
                  />
                  <div className="fv-plugins-message-container invalid-feedback" />
                </div>

                <div className="col-xl-6">
                  <label className="form-label fw-bolder text-dark fs-6">
                    Apellido
                  </label>
                  <input
                    value={usuario?.apellido}
                    onChange={handleChange}
                    className="form-control form-control-lg form-control-solid"
                    type="text"
                    name="apellido"
                    autoComplete="off"
                  />
                  <div className="fv-plugins-message-container invalid-feedback" />
                </div>
              </div>

              <div className="fv-row mb-7 fv-plugins-icon-container">
                <label className="form-label fw-bolder text-dark fs-6">
                  Correo
                </label>
                <input
                  value={usuario?.correoUsuario}
                  onChange={handleChange}
                  className="form-control form-control-lg form-control-solid"
                  type="email"
                  name="correoUsuario"
                  autoComplete="off"
                />
                <div className="fv-plugins-message-container invalid-feedback" />
              </div>

              <div className="fv-row mb-7 fv-plugins-icon-container">
                <label className="form-label fw-bolder text-dark fs-6">
                  Teléfono
                </label>
                <input
                  value={usuario?.telefonoUsuario}
                  onChange={handleChange}
                  className="form-control form-control-lg form-control-solid"
                  type="text"
                  name="telefonoUsuario"
                  autoComplete="off"
                />
                <div className="fv-plugins-message-container invalid-feedback" />
              </div>

              <div
                className="mb-10 fv-row fv-plugins-icon-container"
                data-kt-password-meter="true"
              >
                <div className="mb-1">
                  <label className="form-label fw-bolder text-dark fs-6">
                    Contraseña
                  </label>

                  <div className="position-relative mb-3">
                    <input
                      value={usuario?.pass}
                      onChange={handleChange}
                      className="form-control form-control-lg form-control-solid"
                      type={showPass ? "text" : "password"}
                      name="pass"
                      autoComplete="off"
                    />
                    <span
                    onClick={() => {setshowPass(!showPass)}}
                      className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2"
                      data-kt-password-meter-control="visibility"
                    >
                      <i className={`bi bi-eye-slash fs-2${showPass ? " d-none" : " "}`} />
                      <i className={`bi bi-eye fs-2${!showPass ? " d-none" : " "}`} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="fv-row mb-5 fv-plugins-icon-container">
                <label className="form-label fw-bolder text-dark fs-6">
                  Confirmar contraseña
                </label>
                <input
                  value={confirmacionPass}
                  onChange={(e) => setconfirmacionPass(e.target.value)}

                  className="form-control form-control-lg form-control-solid"
                  type="password"
                  name="confirm-password"
                  autoComplete="off"
                />
                <div className="fv-plugins-message-container invalid-feedback" />
              </div>

              <div className="text-center">
                <button
                  onClick={handleOnClick}
                  data-kt-indicator={cargando ? "on" : "off"}
                  type="button"
                  id="kt_sign_up_submit"
                  className="btn btn-lg btn-primary"
                >
                  <span className="indicator-label">Crear cuenta</span>
                  <span className="indicator-progress">
                    Por favor espere…
                    <span className="spinner-border spinner-border-sm align-middle ms-2" />
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
