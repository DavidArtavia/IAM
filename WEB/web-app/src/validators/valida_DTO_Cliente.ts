import { validadorGenerico } from "./validadorGenerico";
import { DTO_Cliente, DTO_Param } from "@/models";

// tipoValidacion: "C" = Crear, "U" = Actualizar, "D" = Eliminar

export class valida_DTO_Cliente {

  static validar(cliente: DTO_Cliente, tipoValidacion: string): DTO_Param[] {
    const errores: DTO_Param[] = [];

    if (tipoValidacion === "U" || tipoValidacion === "D") {
      if (validadorGenerico.isEmpty(cliente.iD_Cliente)) {
        errores.push({
          nombre: "iD_Cliente",
          valor: "El ID del cliente no puede estar vacío."
        });
      } else if (!validadorGenerico.isNumeric(cliente.iD_Cliente)) {
        errores.push({
          nombre: "iD_Cliente",
          valor: "El ID del cliente debe ser numérico."
        });
      }
    }

    if (validadorGenerico.isEmpty(cliente.iD_Usuario)) {
      errores.push({
        nombre: "iD_Usuario",
        valor: "Debe seleccionar un usuario válido."
      });
    } else if (!validadorGenerico.isNumeric(cliente.iD_Usuario)) {
      errores.push({
        nombre: "iD_Usuario",
        valor: "El ID del usuario debe ser numérico."
      });
    }

    if (validadorGenerico.isEmpty(cliente.estado.iD_Estado)) {
      errores.push({
        nombre: "estado",
        valor: "Debe seleccionar un estado válido."
      });
    } else if (!validadorGenerico.isNumeric(cliente.estado.iD_Estado)) {
      errores.push({
        nombre: "estado",
        valor: "El ID del estado debe ser numérico."
      });
    }

    if (validadorGenerico.isEmpty(cliente.nombreCliente)) {
      errores.push({
        nombre: "nombreCliente",
        valor: "El nombre del cliente es obligatorio."
      });
    } else if (!validadorGenerico.hasMaxLength(cliente.nombreCliente, 100)) {
      errores.push({
        nombre: "nombreCliente",
        valor: `El nombre no puede exceder los 100 caracteres. Actualmente (${cliente.nombreCliente.length}).`
      });
    }

    if (validadorGenerico.isEmpty(cliente.apellidoCliente)) {
      errores.push({
        nombre: "apellidoCliente",
        valor: "El apellido del cliente es obligatorio."
      });
    } else if (!validadorGenerico.hasMaxLength(cliente.apellidoCliente, 100)) {
      errores.push({
        nombre: "apellidoCliente",
        valor: `El apellido no puede exceder los 100 caracteres. Actualmente (${cliente.apellidoCliente.length}).`
      });
    }

    if (!validadorGenerico.hasMaxLength(cliente.telefonoCliente ?? "", 15)) {
      errores.push({
        nombre: "telefonoCliente",
        valor: `El teléfono no puede exceder los 15 caracteres. Actualmente (${(cliente.telefonoCliente ?? "").length}).`
      });
    }

    if (
      cliente.correoCliente &&
      (!validadorGenerico.isEmail(cliente.correoCliente) ||
        !validadorGenerico.hasMaxLength(cliente.correoCliente, 50))
    ) {
      errores.push({
        nombre: "correoCliente",
        valor: "El correo es inválido o excede los 50 caracteres."
      });
    }

    return errores;
  }
}
