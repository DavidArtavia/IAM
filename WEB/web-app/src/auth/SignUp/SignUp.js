import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { usuarioValidator } from "@/validators/usuarioValidator";
import { usuarioService } from "@/services/usuario.service";
import { DTO_Usuario } from "@/models";
import { errorHelpers, notificationHelpers } from "@/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";
export const SignUp = () => {
    //useContext/useStates
    const [usuario, setUsuario] = useState(new DTO_Usuario());
    ;
    const [cargando, setCargando] = useState(false);
    const [showPass, setshowPass] = useState(false);
    const [confirmacionPass, setconfirmacionPass] = useState("");
    //Eventos
    const handleOnClick = () => { validarDatosRegistroUsuario(); };
    //Métodos
    const validarDatosRegistroUsuario = () => {
        if (usuarioValidator.validarDatosRegistroUsuario(usuario, confirmacionPass)) {
            registrarUsuario();
        }
    };
    const registrarUsuario = () => {
        setCargando(true);
        usuarioService.registrarUsuario(usuario).subscribe({
            next: (result) => procesarRespuesta(result),
            error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
            complete: () => { setCargando(false); }
        });
    };
    const procesarRespuesta = (respuesta) => {
        if (respuesta.tipoRespuesta) {
            notificationHelpers.successAlert(respuesta.mensaje);
        }
        else {
            //Controlamos el error del sistema
            errorHelpers.systemError(respuesta);
        }
    };
    // actualiza sólo el campo dinámicamente
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario((prev) => prev
            ? { ...prev, [name]: value }
            : null);
    };
    return (_jsx("div", { className: "d-flex flex-column flex-root", children: _jsx("div", { className: "d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed", style: {
                backgroundImage: 'url("src/assets/media/illustrations/sketchy-1/14.png")',
            }, children: _jsxs("div", { className: "d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20", children: [_jsx("a", { href: "../../demo6/dist/index.html", className: "mb-12", children: _jsx("img", { alt: "Logo", src: "src/assets/media/logos/logo-1.svg", className: "h-40px" }) }), _jsx("div", { className: "w-lg-600px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto", children: _jsxs("form", { className: "form w-100 fv-plugins-bootstrap5 fv-plugins-framework", noValidate: true, id: "kt_sign_up_form", children: [_jsxs("div", { className: "mb-10 text-center", children: [_jsx("h1", { className: "text-dark mb-3", children: "Crear cuenta" }), _jsxs("div", { className: "text-gray-400 fw-bold fs-4", children: ["Ya tienes una cuenta?", _jsx(Link, { to: ROUTES.LOGIN, className: "link-primary fw-bolder", children: "Iniciar sesi\u00F3n" })] })] }), _jsxs("div", { className: "row fv-row mb-7 fv-plugins-icon-container", children: [_jsxs("div", { className: "col-xl-6", children: [_jsx("label", { className: "form-label fw-bolder text-dark fs-6", children: "Nombre" }), _jsx("input", { value: usuario?.nombreUsuario, onChange: handleChange, className: "form-control form-control-lg form-control-solid", type: "text", name: "nombreUsuario", autoComplete: "off" }), _jsx("div", { className: "fv-plugins-message-container invalid-feedback" })] }), _jsxs("div", { className: "col-xl-6", children: [_jsx("label", { className: "form-label fw-bolder text-dark fs-6", children: "Apellido" }), _jsx("input", { value: usuario?.apellido, onChange: handleChange, className: "form-control form-control-lg form-control-solid", type: "text", name: "apellido", autoComplete: "off" }), _jsx("div", { className: "fv-plugins-message-container invalid-feedback" })] })] }), _jsxs("div", { className: "fv-row mb-7 fv-plugins-icon-container", children: [_jsx("label", { className: "form-label fw-bolder text-dark fs-6", children: "Correo" }), _jsx("input", { value: usuario?.correoUsuario, onChange: handleChange, className: "form-control form-control-lg form-control-solid", type: "email", name: "correoUsuario", autoComplete: "off" }), _jsx("div", { className: "fv-plugins-message-container invalid-feedback" })] }), _jsxs("div", { className: "fv-row mb-7 fv-plugins-icon-container", children: [_jsx("label", { className: "form-label fw-bolder text-dark fs-6", children: "Tel\u00E9fono" }), _jsx("input", { value: usuario?.telefonoUsuario, onChange: handleChange, className: "form-control form-control-lg form-control-solid", type: "text", name: "telefonoUsuario", autoComplete: "off" }), _jsx("div", { className: "fv-plugins-message-container invalid-feedback" })] }), _jsx("div", { className: "mb-10 fv-row fv-plugins-icon-container", "data-kt-password-meter": "true", children: _jsxs("div", { className: "mb-1", children: [_jsx("label", { className: "form-label fw-bolder text-dark fs-6", children: "Contrase\u00F1a" }), _jsxs("div", { className: "position-relative mb-3", children: [_jsx("input", { value: usuario?.pass, onChange: handleChange, className: "form-control form-control-lg form-control-solid", type: showPass ? "text" : "password", name: "pass", autoComplete: "off" }), _jsxs("span", { onClick: () => { setshowPass(!showPass); }, className: "btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2", "data-kt-password-meter-control": "visibility", children: [_jsx("i", { className: `bi bi-eye-slash fs-2${showPass ? " d-none" : " "}` }), _jsx("i", { className: `bi bi-eye fs-2${!showPass ? " d-none" : " "}` })] })] })] }) }), _jsxs("div", { className: "fv-row mb-5 fv-plugins-icon-container", children: [_jsx("label", { className: "form-label fw-bolder text-dark fs-6", children: "Confirmar contrase\u00F1a" }), _jsx("input", { value: confirmacionPass, onChange: (e) => setconfirmacionPass(e.target.value), className: "form-control form-control-lg form-control-solid", type: "password", name: "confirm-password", autoComplete: "off" }), _jsx("div", { className: "fv-plugins-message-container invalid-feedback" })] }), _jsx("div", { className: "text-center", children: _jsxs("button", { onClick: handleOnClick, "data-kt-indicator": cargando ? "on" : "off", type: "button", id: "kt_sign_up_submit", className: "btn btn-lg btn-primary", children: [_jsx("span", { className: "indicator-label", children: "Crear cuenta" }), _jsxs("span", { className: "indicator-progress", children: ["Por favor espere\u2026", _jsx("span", { className: "spinner-border spinner-border-sm align-middle ms-2" })] })] }) })] }) })] }) }) }));
};
