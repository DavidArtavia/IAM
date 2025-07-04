import { useState, ReactNode } from 'react';
import { AppContext, AppState } from './AppContext';
import { DTO_Negocio } from '@/models';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    negocio: null,
    listaNegocios: []
  });


  const setNegocio = (neg: DTO_Negocio | null) =>
    setState(prev => ({ ...prev, negocio: neg }));

  const setListaNegocios = (arr: DTO_Negocio[]) =>
  setState(p => ({ ...p, listaNegocios: arr }));

  const value = { state, setNegocio, setListaNegocios };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
