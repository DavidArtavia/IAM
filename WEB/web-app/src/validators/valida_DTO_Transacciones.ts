import { DTO_Transacciones, DTO_Param } from "@/models";
import { validadorGenerico } from "./validadorGenerico";

// tipoValidacion: "C" = Crear, "U" = Actualizar, "D" = Eliminar

export class valida_DTO_Transacciones {
  static validar(transaccion: DTO_Transacciones, tipoValidacion: string): DTO_Param[] {
    const errores: DTO_Param[] = [];

    if (tipoValidacion === "U" || tipoValidacion === "D") {
      if (validadorGenerico.isEmpty(transaccion.iD_Transaccion)) {
        errores.push({
          nombre: "iD_Transaccion",
          valor: "El ID de la transacción no puede estar vacío."
        });
      } else if (!validadorGenerico.isNumeric(transaccion.iD_Transaccion)) {
        errores.push({
          nombre: "iD_Transaccion",
          valor: "El ID de la transacción debe ser numérico."
        });
      }
    }

    if (validadorGenerico.isEmpty(transaccion.iD_Negocio)) {
      errores.push({
        nombre: "iD_Negocio",
        valor: "El ID del negocio no puede estar vacío."
      });
    } else if (!validadorGenerico.isNumeric(transaccion.iD_Negocio)) {
      errores.push({
        nombre: "iD_Negocio",
        valor: "El ID del negocio debe ser numérico."
      });
    }

    if (validadorGenerico.isEmpty(transaccion.estado.iD_Estado)) {
      errores.push({
        nombre: "estado",
        valor: "Debe seleccionar un estado."
      });
    } else if (!validadorGenerico.isNumeric(transaccion.estado.iD_Estado)) {
      errores.push({
        nombre: "estado",
        valor: "El ID del estado debe ser numérico."
      });
    }

    if (validadorGenerico.isEmpty(transaccion.concepto)) {
      errores.push({
        nombre: "concepto",
        valor: "El concepto es obligatorio."
      });
    } else if (!validadorGenerico.hasMaxLength(transaccion.concepto, 100)) {
      errores.push({
        nombre: "concepto",
        valor: `El concepto no puede exceder los 100 caracteres. Actualmente (${transaccion.concepto.length}).`
      });
    }

    if (validadorGenerico.isEmpty(transaccion.monto)) {
      errores.push({
        nombre: "monto",
        valor: "El monto es obligatorio."
      });
    } else if (!validadorGenerico.isNumeric(transaccion.monto)) {
      errores.push({
        nombre: "monto",
        valor: "El monto debe ser un número válido."
      });
    } else if (validadorGenerico.isCero(transaccion.monto)) {
      errores.push({
        nombre: "monto",
        valor: "El monto debe ser mayor a cero"
      });
    }

    if (validadorGenerico.isEmpty(transaccion.tipo)) {
      errores.push({
        nombre: "tipo",
        valor: "El tipo de transacción es obligatorio."
      });
    } else if (!validadorGenerico.hasMaxLength(transaccion.tipo, 50)) {
      errores.push({
        nombre: "tipo",
        valor: `El tipo no puede exceder los 50 caracteres. Actualmente (${transaccion.tipo.length}).`
      });
    }

    if (!validadorGenerico.hasMaxLength(transaccion.numReferencia ?? "", 100)) {
      errores.push({
        nombre: "numReferencia",
        valor: `El número de referencia no puede exceder los 100 caracteres. Actualmente (${(transaccion.numReferencia ?? "").length}).`
      });
    }

    if (!validadorGenerico.hasMaxLength(transaccion.tipoNumReferencia ?? "", 50)) {
      errores.push({
        nombre: "tipoNumReferencia",
        valor: `El tipo del número de referencia no puede exceder los 50 caracteres. Actualmente (${(transaccion.tipoNumReferencia ?? "").length}).`
      });
    }

    if (!validadorGenerico.isDate(transaccion.fechaTransaccion)) {
      errores.push({
        nombre: "fechaTransaccion",
        valor: "La fecha de la transacción es inválida."
      });
    }

    return errores;
  }
}
