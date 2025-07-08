import { DTO_Negocio } from '@/models';
export interface AppState {
    negocio: DTO_Negocio | null;
    listaNegocios: DTO_Negocio[];
}
export interface AppContextType {
    state: AppState;
    setNegocio: (n: DTO_Negocio | null) => void;
    setListaNegocios: (arr: DTO_Negocio[]) => void;
}
export declare const AppContext: import("react").Context<AppContextType>;
