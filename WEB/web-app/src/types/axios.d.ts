// src/types/axios.d.ts
import "axios";

declare module "axios" {
    export interface AxiosRequestConfig {
        /**  
         * Si está en `true`, el interceptor global de respuesta NO hará logout/refresh  
         */
        skipAuthHandler?: boolean;
    }
}