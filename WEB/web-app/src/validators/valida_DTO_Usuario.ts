import { validadorGenerico } from "./validadorGenerico";
import { DTO_Param, DTO_Usuario } from "@/models";

// tipoValidacion: "C" = Crear, "U" = Actualizar, "D" = Eliminar, "L" = login

export class valida_DTO_Usuario {

  static validar(usuario: DTO_Usuario, tipoValidacion: string): DTO_Param[] {
    const errores: DTO_Param[] = [];

    if (tipoValidacion === "L") {
      if (validadorGenerico.isEmpty(usuario.correoUsuario)) {
        errores.push({
          nombre: "correoUsuario",
          valor: "El correo del usuario no puede estar vacío."
        });
      } else if (!validadorGenerico.isEmail(usuario.correoUsuario)) {
        errores.push({
          nombre: "correoUsuario",
          valor: "El correo del usuario no es válido."
        });
      }

      if (validadorGenerico.isEmpty(usuario.pass)) {
        errores.push({
          nombre: "pass",
          valor: "La contraseña no puede estar vacía."
        });
      }
    }

    if (tipoValidacion === "C") {

      if (validadorGenerico.isEmpty(usuario.nombreUsuario)) {
        errores.push({
          nombre: "nombreUsuario",
          valor: "El nombre no puede estar vacío."
        });
      }
      if (validadorGenerico.hasEmojis(usuario.nombreUsuario)) {
        errores.push({
          nombre: "nombreUsuario",
          valor: "El nombre no puede contener emojis."
        });
      }
      if (validadorGenerico.onlyTextAllowed(usuario.nombreUsuario)) {
        errores.push({
          nombre: "nombreUsuario",
          valor: "El nombre solo puede contener texto."
        });
      }

      if (validadorGenerico.isEmpty(usuario.apellido)) {
        errores.push({
          nombre: "apellido",
          valor: "El apellido no puede estar vacío."
        });
      }
      if (validadorGenerico.hasEmojis(usuario.apellido)) {
        errores.push({
          nombre: "apellido",
          valor: "El apellido no puede contener emojis."
        });
      }
      if (validadorGenerico.onlyTextAllowed(usuario.apellido)) {
        errores.push({
          nombre: "apellido",
          valor: "El apellido solo puede contener texto."
        });
      }

      if (validadorGenerico.isEmpty(usuario.correoUsuario)) {
        errores.push({
          nombre: "correoUsuario",
          valor: "El correo no puede estar vacío."
        });
      } else if (!validadorGenerico.isEmail(usuario.correoUsuario)) {
        errores.push({
          nombre: "correoUsuario",
          valor: "El correo no es válido."
        });
      }

      if (validadorGenerico.isEmpty(usuario.telefonoUsuario)) {
        errores.push({
          nombre: "telefonoUsuario",
          valor: "El teléfono no puede estar vacío."
        });
      } else if (!validadorGenerico.isPhoneNumber(usuario.telefonoUsuario)) {
        errores.push({
          nombre: "telefonoUsuario",
          valor: "El teléfono no es válido."
        });
      }

      if (validadorGenerico.isEmpty(usuario.pass)) {
        errores.push({
          nombre: "pass",
          valor: "La contraseña no puede estar vacía."
        });
      }

    }

    return errores;
  }
}
