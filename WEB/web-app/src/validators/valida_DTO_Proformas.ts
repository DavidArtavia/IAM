import { validadorGenerico } from "./validadorGenerico";
import {DTO_Param, DTO_Proforma } from "@/models";

// tipoValidacion: "C" = Crear, "U" = Actualizar, "D" = Eliminar

export class valida_DTO_Proformas {

  static validar(proforma: DTO_Proforma, tipoValidacion: string): DTO_Param[] {
    const errores: DTO_Param[] = [];

    if (tipoValidacion === "U" || tipoValidacion === "D") {
      if (validadorGenerico.isEmpty(proforma.iD_Cliente)) {
        errores.push({
          nombre: "iD_Cliente",
          valor: "El ID del cliente no puede estar vacío."
        });
      } else if (!validadorGenerico.isNumeric(proforma.iD_Cliente)) {
          errores.push({
              nombre: "iD_Cliente",
              valor: "El ID del cliente debe ser numérico."
            });
        }
    }

     if (!validadorGenerico.hasMaxLength(proforma.observacionProforma, 100)) {
      errores.push({
        nombre: "observacionProforma",
        valor: `La observación no puede exceder los 100 caracteres. Actualmente (${proforma.observacionProforma.length}).`
      });
      }

    return errores;
  }
}
