import { DTO_Respuesta } from "@/models";
import { errorHelpers } from "./errorHelpers";

//metodo generico para procesar lo que envía el server
export const procesarRespuesta = (respuesta: DTO_Respuesta) => {
    
    if (respuesta.tipoRespuesta) {
        return respuesta.resultado[0]
    } else {
        //Controlamos el error del sistema
        errorHelpers.systemError(respuesta);
        return null
    }
}