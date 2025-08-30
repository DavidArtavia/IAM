import { DTO_ProformaItem, DTO_Param } from "@/models";
import { validadorGenerico } from "./validadorGenerico";

// tipoValidacion: "C" = Crear, "U" = Actualizar, "D" = Eliminar

export class valida_DTO_ProformaItem {
    static validar(item: DTO_ProformaItem, tipoValidacion: string): DTO_Param[] {
        const errores: DTO_Param[] = [];

        // Validar ID si es actualización o eliminación
        if (tipoValidacion === "U" || tipoValidacion === "D") {
            if (validadorGenerico.isEmpty(item.iD_ProformaItem)) {
                errores.push({
                    nombre: "iD_ProformaItem",
                    valor: "El ID del ítem de proforma no puede estar vacío."
                });
            } else if (!validadorGenerico.isNumeric(item.iD_ProformaItem)) {
                errores.push({
                    nombre: "iD_ProformaItem",
                    valor: "El ID del ítem de proforma debe ser numérico."
                });
            }
        }

        // ID de proforma (obligatorio)
        if (validadorGenerico.isEmpty(item.iD_Proforma)) {
            errores.push({
                nombre: "iD_Proforma",
                valor: "Debe asignarse una proforma válida."
            });
        } else if (!validadorGenerico.isNumeric(item.iD_Proforma)) {
            errores.push({
                nombre: "iD_Proforma",
                valor: "El ID de la proforma debe ser numérico."
            });
        }

        // Estado (ID_Estado)
        if (validadorGenerico.isEmpty(item.estado.iD_Estado)) {
            errores.push({
                nombre: "estado",
                valor: "Debe seleccionar un estado válido."
            });
        } else if (!validadorGenerico.isNumeric(item.estado.iD_Estado)) {
            errores.push({
                nombre: "estado",
                valor: "El estado debe ser numérico."
            });
        }

        // Nombre del ítem (requerido, máx 100)
        if (validadorGenerico.isEmpty(item.nombreItemProforma)) {
            errores.push({
                nombre: "nombreItemProforma",
                valor: "El nombre del ítem es obligatorio."
            });
        } else if (!validadorGenerico.hasMaxLength(item.nombreItemProforma, 100)) {
            errores.push({
                nombre: "nombreItemProforma",
                valor: `El nombre no puede exceder los 100 caracteres. Actualmente (${item.nombreItemProforma.length}).`
            });
        }

        // Descripción (opcional, máx 255)
        if (!validadorGenerico.hasMaxLength(item.descripcionItemProforma ?? "", 255)) {
            errores.push({
                nombre: "descripcionItemProforma",
                valor: `La descripción no puede exceder los 255 caracteres. Actualmente (${(item.descripcionItemProforma ?? "").length}).`
            });
        }

        // Precio (obligatorio, numérico)
        if (validadorGenerico.isEmpty(item.precioItemProforma)) {
            errores.push({
                nombre: "precioItemProforma",
                valor: "Debe ingresar el precio del ítem."
            });
        } else if (!validadorGenerico.isNumeric(item.precioItemProforma)) {
            errores.push({
                nombre: "precioItemProforma",
                valor: "El precio debe ser numérico."
            });
        } else if (!validadorGenerico.isNonNegative(item.precioItemProforma)) {
            errores.push({
                nombre: "cantidad",
                valor: "El precio debe ser un valor positivo."
            });
        }

        // Cantidad (obligatoria, numérica)
        if (validadorGenerico.isEmpty(item.cantidadItemProforma)) {
            errores.push({
                nombre: "cantidadItemProforma",
                valor: "Debe ingresar la cantidad del ítem."
            });
        } else if (!validadorGenerico.isNumeric(item.cantidadItemProforma)) {
            errores.push({
                nombre: "cantidadItemProforma",
                valor: "La cantidad debe ser numérica."
            });
        }
        else if (!validadorGenerico.isNonNegative(item.precioItemProforma)) {
            errores.push({
                nombre: "cantidad",
                valor: "La cantidad debe ser un valor positivo."
            });
        }
        // Fecha de creación (obligatoria)
        if (!validadorGenerico.isDate(item.fechaCreacion)) {
            errores.push({
                nombre: "fechaCreacion",
                valor: "La fecha de creación es inválida."
            });
        }

        // Fecha de modificación (opcional)
        if (item.fechaModificacion && !validadorGenerico.isDate(item.fechaModificacion)) {
            errores.push({
                nombre: "fechaModificacion",
                valor: "La fecha de modificación es inválida."
            });
        }

        return errores;
    }
}
