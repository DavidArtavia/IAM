import { DTO_OrdenServicio, DTO_Param } from "@/models";
import { validadorGenerico } from "./validadorGenerico";

//tipoValidacion C: Crear, D: Eliminar, U: Actualizar

export class valida_DTO_OrdenServicio {
    static validar(orden: DTO_OrdenServicio, tipoValidacion: string): DTO_Param[] {
        const errores: DTO_Param[] = [];

        if (validadorGenerico.isEmpty(orden.iD_Cliente)) {
            errores.push({ nombre: "iD_Cliente", valor: "El cliente no puede estar vacío." });
        } else if (!validadorGenerico.isNumeric(orden.iD_Cliente)) {
            errores.push({ nombre: "iD_Cliente", valor: "Número de cliente inválido." });
        } else if (validadorGenerico.isCero(orden.iD_Cliente)) {
            errores.push({ nombre: "iD_Cliente", valor: "Seleccione un cliente por favor." });
        }

        if (validadorGenerico.isEmpty(orden.iD_Negocio)) {
            errores.push({ nombre: "iD_Negocio", valor: "El identificador del negocio no puede estar vacío." });
        } else if (!validadorGenerico.isNumeric(orden.iD_Negocio)) {
            errores.push({ nombre: "iD_Negocio", valor: "Número de negocio iválido." });
        }


        if (validadorGenerico.isEmpty(orden.estado.iD_Estado)) {
            errores.push({ nombre: "estado", valor: "El identificador del negocio no puede estar vacío." });
        } else if (!validadorGenerico.isNumeric(orden.estado.iD_Estado)) {
            errores.push({ nombre: "estado", valor: "Número de negocio iválido." });
        }

        //Se valída solo si viene el dato ya que no es un campo obligatorio
        if (orden.fechaEstimadaEntrega != null) {
            if (!validadorGenerico.isDate(orden.fechaEstimadaEntrega ? orden.fechaEstimadaEntrega.toString() : "")) {
                errores.push({ nombre: "fechaEstimadaEntrega", valor: "Fecha de estimada inválida." });
            }
        }

        //Se valída solo si viene el dato ya que no es un campo obligatorio
        if (orden.fechaInicio != null) {
            if (!validadorGenerico.isDate(orden.fechaInicio ? orden.fechaInicio.toString() : "")) {
                errores.push({ nombre: "fechaInicio", valor: "Fecha de inicio inválida." });
            }
        }

        //Se valída solo si viene el dato ya que no es un campo obligatorio
        if (orden.fechaEntrega != null) {
            if (!validadorGenerico.isDate(orden.fechaEntrega ? orden.fechaEntrega.toString() : "")) {
                errores.push({ nombre: "fechaEntrega", valor: "Fecha de entrega inválida." });
            }
        }



        if (!validadorGenerico.hasMaxLength(orden.notaOrdenServicio, 255)) {
            errores.push({ nombre: "notaOrdenServicio", valor: "Las notas no pueden exceder los 255 caracteres. Actualmente (" + orden.notaOrdenServicio.length + ")" });
        }


        if (tipoValidacion === "U") {
            if (validadorGenerico.isEmpty(orden.fechaOrdenServicio)) {
                errores.push({ nombre: "fechaOrdenServicio", valor: "Fecha de creación obligatoria." });
            } else if (!validadorGenerico.isDate(orden.fechaOrdenServicio ? orden.fechaOrdenServicio.toString() : "")) {
                errores.push({ nombre: "fechaOrdenServicio", valor: "Fecha de creación inválida." });
            }
        }

        if (tipoValidacion === "U" || tipoValidacion === "D") {
            if (validadorGenerico.isEmpty(orden.iD_OrdenServicio)) {
                errores.push({ nombre: "iD_OrdenServicio", valor: "El número de la orden de servicio no puede estar vacío." });
            } else if (!validadorGenerico.isNumeric(orden.iD_Cliente)) {
                errores.push({ nombre: "iD_OrdenServicio", valor: "El número de la orden de servicio es inválido." });
            }
        }


        return errores;
    }
}