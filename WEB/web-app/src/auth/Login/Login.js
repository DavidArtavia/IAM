import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { usuarioValidator } from "@/validators/usuarioValidator";
import { usuarioService } from "@/services/usuario.service";
import { errorHelpers, notificationHelpers } from "@/utils";
import { Link, useNavigate } from "react-router-dom";
import { DTO_Usuario } from "@/models";
import { ROUTES } from "@/constants";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
export const Login = () => {
    //useContext/useStates
    const [usuario, setUsuario] = useState(new DTO_Usuario());
    ;
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    //Eventos
    const handleOnClick = () => { validarDatosLogin(); };
    //Métodos
    const validarDatosLogin = () => {
        if (usuarioValidator.validarDatosLogin(usuario)) {
            autenticarUsuario();
        }
    };
    const autenticarUsuario = () => {
        setCargando(true);
        usuarioService.autenticarUsuario(usuario).subscribe({
            next: (result) => procesarRespuesta(result),
            error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
            complete: () => { setCargando(false); }
        });
    };
    // actualiza sólo el campo dinámicamente
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario((prev) => prev
            ? { ...prev, [name]: value }
            : null);
    };
    const procesarRespuesta = (respuesta) => {
        if (respuesta.tipoRespuesta) {
            const user = respuesta.resultado[0];
            //@ts-expect-error - Aqui se obtiene el token 
            const accesToken = respuesta.resultado[1].accesToken;
            localStorage.setItem("accesToken", accesToken);
            setUsuario(user);
            login(user, accesToken);
            notificationHelpers.successAlert(`Hola ${user.nombreUsuario + " " + user.apellido}, bienvenido de nuevo 👋`);
            const lastPath = localStorage.getItem("lastPath") || ROUTES.HOME;
            setTimeout(() => {
                navigate(lastPath, { replace: true });
            }, 200);
        }
        else {
            //Controlamos el error del sistema
            errorHelpers.systemError(respuesta);
        }
    };
    return (_jsx("div", { className: "d-flex flex-column flex-root", children: _jsxs("div", { className: "d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed", style: {
                backgroundImage: 'url("src/assets/media/illustrations/sketchy-1/14.png")',
            }, children: [_jsxs("div", { className: "d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20", children: [_jsx("a", { className: "mb-12", children: _jsx("img", { alt: "Logo", src: "src/assets/media/logos/logo-1.svg", className: "h-40px" }) }), _jsxs("div", { className: "w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto", children: [_jsxs("form", { className: "form w-100 fv-plugins-bootstrap5 fv-plugins-framework", noValidate: true, id: "kt_sign_in_form", children: [_jsxs("div", { className: "text-center mb-10", children: [_jsx("h1", { className: "text-dark mb-3", children: "Iniciar Sesi\u00F3n" }), _jsx("div", { className: "text-gray-400 fw-bold fs-4", children: _jsx(Link, { to: ROUTES.SIGNUP, className: "link-primary fw-bolder", children: "Crear una cuenta" }) })] }), _jsxs("div", { className: "fv-row mb-10 fv-plugins-icon-container", children: [_jsx("label", { className: "form-label fs-6 fw-bolder text-dark", children: "Email" }), _jsx("input", { value: usuario?.correoUsuario, onChange: handleChange, className: "form-control form-control-lg form-control-solid", type: "text", name: "correoUsuario", autoComplete: "off", placeholder: "ejemplo@gmail.com" }), _jsx("div", { className: "fv-plugins-message-container invalid-feedback" })] }), _jsxs("div", { className: "fv-row mb-10 fv-plugins-icon-container", children: [_jsx("div", { className: "d-flex flex-stack mb-2", children: _jsx("label", { className: "form-label fw-bolder text-dark fs-6 mb-0", children: "Password" }) }), _jsx("input", { value: usuario?.pass, onChange: handleChange, className: "form-control form-control-lg form-control-solid", type: "password", name: "pass", autoComplete: "off" }), _jsx("div", { className: "fv-plugins-message-container invalid-feedback" })] }), _jsx("div", { className: "text-center" })] }), _jsxs("button", { id: "kt_sign_in_submit", className: "btn btn-lg btn-primary w-100 mb-5", onClick: handleOnClick, "data-kt-indicator": cargando ? "on" : "off", children: [_jsx("span", { className: "indicator-label", children: "Continuar" }), _jsxs("span", { className: "indicator-progress", children: ["Por favor espere\u2026", _jsx("span", { className: "spinner-border spinner-border-sm align-middle ms-2" })] })] })] })] }), _jsx("div", { className: "d-flex flex-center flex-column-auto p-10", children: _jsx("div", { className: "d-flex align-items-center fw-bold fs-6" }) })] }) }));
};
export default Login;
