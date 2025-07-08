import { errorHelpers } from "./errorHelpers";
//metodo generico para procesar lo que envía el server
export const processResponse = (respuesta) => {
    if (respuesta.tipoRespuesta) {
        return respuesta.resultado[0];
    }
    else {
        //Controlamos el error del sistema
        errorHelpers.systemError(respuesta);
        return null;
    }
};
