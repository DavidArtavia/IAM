import { notificationHelpers } from "@/utils";
export class usuarioValidator {
    constructor() { }
    static validarDatosLogin(usuario) {
        let estadoValidacion = false;
        const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
        if (usuario)
            if (!usuario.correoUsuario || !usuario.pass) {
                notificationHelpers.warningAlert("Por favor, completa todos los campos.");
            }
            else if (!validateEmail(usuario.correoUsuario)) {
                notificationHelpers.warningAlert("Por favor, ingresa un correo electrónico válido.");
            }
            else {
                estadoValidacion = true;
            }
        return estadoValidacion;
    }
    static validarDatosRegistroUsuario(usuario, confirmacionPass) {
        let estadoValidacion = false;
        const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
        if (usuario)
            if (!usuario.correoUsuario || !usuario.pass || !usuario.apellido || !usuario.nombreUsuario || !usuario.telefonoUsuario || !confirmacionPass) {
                notificationHelpers.warningAlert("Por favor, completa todos los campos.");
            }
            else if (!validateEmail(usuario.correoUsuario)) {
                notificationHelpers.warningAlert("Por favor, ingresa un correo electrónico válido.");
            }
            else if (usuario.pass.length < 6) {
                notificationHelpers.warningAlert("La contraseña debe ser superior a 6 caracteres");
            }
            else if (usuario.pass != confirmacionPass) {
                notificationHelpers.warningAlert("Las contraseñas co coinciden");
            }
            else {
                estadoValidacion = true;
            }
        return estadoValidacion;
    }
}
