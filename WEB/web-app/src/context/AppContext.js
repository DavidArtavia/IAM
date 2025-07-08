import { createContext } from 'react';
export const AppContext = createContext({
    state: { negocio: null, listaNegocios: [] },
    setNegocio: () => { },
    setListaNegocios: () => { },
});
