//import { logoutUser } from "@/utils/authHelpers";
import { DTO_Respuesta } from "@/models";
import { notificationHelpers } from "@/utils";
import { AxiosError } from "axios";

export class errorHelpers {

    constructor() { }
    //probar esto para que se termine de configurar y lo devuelva al login en caso de ser un 401
    //Estos errores son los que genera el servidor, como errores de autorización
    //es bool para saber si se debe reintentar
    static serverError(err: AxiosError): boolean {
        let reintento: boolean = false;

        if (err.status == 401) {
            notificationHelpers.errorAlert("Sesión no válida");
            
        } else if (err.status == 403) {
            reintento = true;
            //verificar aqui cómo viene la data para guardar el nuevo acces token

        } else {
            console.error("Error desconocido:", err);
            notificationHelpers.errorAlert("Error desconocido");
        }
        return reintento;
    }
    //Estos errores son los que genera el sistema, alertas guardadas o excepciones controladas
    static systemError(respuesta: DTO_Respuesta) {
        notificationHelpers.errorAlert(respuesta.mensaje)
    }


}