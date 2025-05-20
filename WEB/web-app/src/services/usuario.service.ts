import { DTO_Respuesta } from 'models';
import { DTO_Usuario } from 'models';
import { Observable, defer, map } from 'rxjs';
import axios, { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from "@/constants";

export class usuarioService {

  constructor() { }

  static autenticarUsuario(usuario: DTO_Usuario): Observable<DTO_Respuesta>{ 
    return defer(() => axios.post<DTO_Respuesta>(API_ENDPOINTS.BASE_URL + API_ENDPOINTS.AUTH.LOGIN, usuario as DTO_Usuario)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
   }

  static registrarUsuario(usuario: DTO_Usuario): Observable<DTO_Respuesta>{ 
    return defer(() => axios.post<DTO_Respuesta>(API_ENDPOINTS.BASE_URL + API_ENDPOINTS.USERS.CREATE, usuario as DTO_Usuario)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
   }

}
