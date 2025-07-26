import { DTO_Negocio, DTO_Param } from "@/models";
import { validadorGenerico } from "./validadorGenerico";

// tipoValidacion: "C" = Crear, "U" = Actualizar, "D" = Eliminar

export class valida_DTO_Negocio {
  static validar(negocio: DTO_Negocio, tipoValidacion: string): DTO_Param[] {
    const errores: DTO_Param[] = [];

    if (tipoValidacion === "U" || tipoValidacion === "D") {
      if (validadorGenerico.isEmpty(negocio.iD_Negocio)) {
        errores.push({
          nombre: "iD_Negocio",
          valor: "El ID del negocio no puede estar vacío."
        });
      } else if (!validadorGenerico.isNumeric(negocio.iD_Negocio)) {
        errores.push({
          nombre: "iD_Negocio",
          valor: "El ID del negocio debe ser numérico."
        });
      }
    }

    if (validadorGenerico.isEmpty(negocio.iD_Usuario)) {
      errores.push({
        nombre: "iD_Usuario",
        valor: "Debe seleccionar un usuario válido."
      });
    } else if (!validadorGenerico.isNumeric(negocio.iD_Usuario)) {
      errores.push({
        nombre: "iD_Usuario",
        valor: "El ID del usuario debe ser numérico."
      });
    }

    if (validadorGenerico.isEmpty(negocio.estado.iD_Estado)) {
      errores.push({
        nombre: "estado",
        valor: "Debe seleccionar un estado válido."
      });
    } else if (!validadorGenerico.isNumeric(negocio.estado.iD_Estado)) {
      errores.push({
        nombre: "estado",
        valor: "El ID del estado debe ser numérico."
      });
    }

    if (validadorGenerico.isEmpty(negocio.nombreNegocio)) {
      errores.push({
        nombre: "nombreNegocio",
        valor: "El nombre del negocio es obligatorio."
      });
    } else if (!validadorGenerico.hasMaxLength(negocio.nombreNegocio, 100)) {
      errores.push({
        nombre: "nombreNegocio",
        valor: `El nombre no puede exceder los 100 caracteres. Actualmente (${negocio.nombreNegocio.length}).`
      });
    }

    if (!validadorGenerico.hasMaxLength(negocio.descripcion ?? "", 255)) {
      errores.push({
        nombre: "descripcion",
        valor: `La descripción no puede exceder los 255 caracteres. Actualmente (${(negocio.descripcion ?? "").length}).`
      });
    }

    if (!validadorGenerico.hasMaxLength(negocio.direccion ?? "", 255)) {
      errores.push({
        nombre: "direccion",
        valor: `La dirección no puede exceder los 255 caracteres. Actualmente (${(negocio.direccion ?? "").length}).`
      });
    }

    if (!validadorGenerico.hasMaxLength(negocio.telefonoNegocio ?? "", 20)) {
      errores.push({
        nombre: "telefonoNegocio",
        valor: `El teléfono no puede exceder los 20 caracteres. Actualmente (${(negocio.telefonoNegocio ?? "").length}).`
      });
    }

    if (
      negocio.correoNegocio &&
      (!validadorGenerico.isEmail(negocio.correoNegocio) ||
        !validadorGenerico.hasMaxLength(negocio.correoNegocio, 100))
    ) {
      errores.push({
        nombre: "correoNegocio",
        valor: "El correo es inválido o excede los 100 caracteres."
      });
    }

    if (!validadorGenerico.isDate(negocio.fechaRegistro)) {
      errores.push({
        nombre: "fechaRegistro",
        valor: "La fecha de registro es inválida."
      });
    }

    return errores;
  }
}
