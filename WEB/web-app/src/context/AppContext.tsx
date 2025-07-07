import { createContext } from 'react';
import { DTO_Negocio } from '@/models';

//La idea de este App context es que podamos posteriormente agregar más a la estructura 
// y seguir usando el mismo

export interface AppState {
  negocio: DTO_Negocio | null; //negocio seleccionado
  listaNegocios: DTO_Negocio[]; //lista de negocios
  //Auí podríamos agregar más si la cuestion se pone más complicada en datos globales
}


export interface AppContextType {
  state: AppState;
  setNegocio: (n: DTO_Negocio | null) => void;
  setListaNegocios: (arr: DTO_Negocio[]) => void;
}


export const AppContext = createContext<AppContextType>({
  state: { negocio: null, listaNegocios: [] },
  setNegocio: () => {},
  setListaNegocios: () => {},
});
