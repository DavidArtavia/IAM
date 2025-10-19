import { DTO_Usuario, DTO_Respuesta } from "@/models";
import { Observable, defer, map } from "rxjs";
import { API_ENDPOINTS } from "@/constants";
import { api } from "@/api";
import { AxiosResponse } from "axios";

export class usuarioService {

  // Autenticación
  static autenticarUsuario(usuario: DTO_Usuario): Observable<DTO_Respuesta> {
    return defer(() =>
      api.post<DTO_Respuesta>(API_ENDPOINTS.AUTH.LOGIN, usuario)
    ).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data as DTO_Respuesta));
  }

  // Registro
  static registrarUsuario(usuario: DTO_Usuario): Observable<DTO_Respuesta> {
    return defer(() =>
      api.post<DTO_Respuesta>(API_ENDPOINTS.USERS.CREATE, usuario)
    ).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data as DTO_Respuesta));
  }

  // Generar código de verificación
  static generarCodigoVerificacion(usuario: DTO_Usuario): Observable<DTO_Respuesta> {
    return defer(() =>
      api.post<DTO_Respuesta>(API_ENDPOINTS.AUTH.VERIFY.GENERATE, usuario)
    ).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data as DTO_Respuesta));
  }

  // Reenviar código de verificación
  static reenviarCodigoVerificacion(usuario: DTO_Usuario): Observable<DTO_Respuesta> {
    return defer(() =>
      api.post<DTO_Respuesta>(API_ENDPOINTS.AUTH.VERIFY.RESEND, usuario)
    ).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data as DTO_Respuesta));
  }

  // Validar código de verificación
  static validarCodigoVerificacion(usuario: DTO_Usuario): Observable<DTO_Respuesta> {

    return defer(() =>
      api.post<DTO_Respuesta>(API_ENDPOINTS.AUTH.VERIFY.VALIDATE, usuario)
    ).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data as DTO_Respuesta));
  }
}