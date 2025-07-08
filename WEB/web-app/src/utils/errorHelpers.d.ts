import { DTO_Respuesta } from "@/models";
import { AxiosError } from "axios";
export declare class errorHelpers {
    constructor();
    static serverError(err: AxiosError): boolean;
    static systemError(respuesta: DTO_Respuesta): void;
}
