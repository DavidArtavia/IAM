import { DTO_Usuario, DTO_Respuesta } from 'models';
import { Observable, defer, map } from 'rxjs';
import { API_ENDPOINTS } from "@/constants";
import { api } from '@/api';
import { AxiosResponse } from 'axios';

export class usuarioService {

  constructor() { }

  static autenticarUsuario(usuario: DTO_Usuario): Observable<DTO_Respuesta>{ 
    return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.AUTH.LOGIN, usuario as DTO_Usuario)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
   }

  static registrarUsuario(usuario: DTO_Usuario): Observable<DTO_Respuesta>{ 
    return defer(() => api.post<DTO_Respuesta>(API_ENDPOINTS.USERS.CREATE, usuario as DTO_Usuario)).pipe(map((r: AxiosResponse<DTO_Respuesta>) => r.data));
   }

}
