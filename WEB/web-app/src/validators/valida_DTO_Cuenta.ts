import { DTO_Cuenta, DTO_Param } from "@/models";
import { validadorGenerico } from "./validadorGenerico";

// tipoValidacion: "C" = Crear, "U" = Actualizar, "D" = Eliminar

export class valida_DTO_Cuenta {
  static validar(cuenta: DTO_Cuenta, tipoValidacion: string): DTO_Param[] {
    const errores: DTO_Param[] = [];

    if (tipoValidacion === "U" || tipoValidacion === "D") {
      if (validadorGenerico.isEmpty(cuenta.iD_Cuenta)) {
        errores.push({ nombre: "iD_Cuenta", valor: "El ID de la cuenta no puede estar vacío." });
      } else if (!validadorGenerico.isNumeric(cuenta.iD_Cuenta)) {
        errores.push({ nombre: "iD_Cuenta", valor: "El ID de la cuenta debe ser numérico." });
      }
    }

    if (validadorGenerico.isEmpty(cuenta.iD_Negocio)) {
      errores.push({ nombre: "iD_Negocio", valor: "El ID del negocio no puede estar vacío." });
    } else if (!validadorGenerico.isNumeric(cuenta.iD_Negocio)) {
      errores.push({ nombre: "iD_Negocio", valor: "El ID del negocio debe ser numérico." });
    }

    if (validadorGenerico.isEmpty(cuenta.estado.iD_Estado)) {
      errores.push({ nombre: "estado", valor: "Debe seleccionar un estado." });
    } else if (!validadorGenerico.isNumeric(cuenta.estado.iD_Estado)) {
      errores.push({ nombre: "estado", valor: "El ID del estado debe ser numérico." });
    }

    if (validadorGenerico.isEmpty(cuenta.concepto)) {
      errores.push({ nombre: "concepto", valor: "El concepto es obligatorio." });
    } else if (!validadorGenerico.hasMaxLength(cuenta.concepto, 50)) {
      errores.push({
        nombre: "concepto",
        valor: `El concepto no puede exceder los 50 caracteres. Actualmente (${cuenta.concepto.length}).`
      });
    }

    if (!validadorGenerico.hasMaxLength(cuenta.descripcion ?? "", 255)) {
      errores.push({
        nombre: "descripcion",
        valor: `La descripción no puede exceder los 255 caracteres. Actualmente (${(cuenta.descripcion ?? "").length}).`
      });
    }

    if (validadorGenerico.isEmpty(cuenta.monto)) {
      errores.push({ nombre: "monto", valor: "El monto es obligatorio." });
    } else if (!validadorGenerico.isNumeric(cuenta.monto)) {
      errores.push({ nombre: "monto", valor: "El monto debe ser un número válido." });
    }

    if (validadorGenerico.isEmpty(cuenta.tipoCuenta)) {
      errores.push({ nombre: "tipoCuenta", valor: "El tipo de cuenta es obligatorio." });
    } else if (!validadorGenerico.hasMaxLength(cuenta.tipoCuenta, 50)) {
      errores.push({
        nombre: "tipoCuenta",
        valor: `El tipo de cuenta no puede exceder los 50 caracteres. Actualmente (${cuenta.tipoCuenta.length}).`
      });
    }

    if (!validadorGenerico.isDate(cuenta.fechaInicial)) {
      errores.push({ nombre: "fechaInicial", valor: "La fecha inicial es inválida." });
    }

    if (!validadorGenerico.isDate(cuenta.fechaModificacion)) {
      errores.push({ nombre: "fechaModificacion", valor: "La fecha de modificación es inválida." });
    }

    if (!validadorGenerico.isDate(cuenta.fechaLimite)) {
      errores.push({ nombre: "fechaLimite", valor: "La fecha límite es inválida." });
    }

    if (cuenta.iD_OrdenServicio != null && !validadorGenerico.isNumeric(cuenta.iD_OrdenServicio)) {
      errores.push({ nombre: "iD_OrdenServicio", valor: "El ID de orden de servicio debe ser numérico." });
    }
    
    if (typeof cuenta.detalleJSON === "string" && validadorGenerico.startsWith(cuenta.detalleJSON,"error_force_")) {
      errores.push({ nombre: "detalleJSON", valor: "Tiene un detalle sin agregar, por favor precione el ícono \"+\" o limpie los campos" });
    }

    return errores;
  }
}
