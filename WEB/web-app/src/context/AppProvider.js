import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { AppContext } from './AppContext';
export const AppProvider = ({ children }) => {
    const [state, setState] = useState({
        negocio: null,
        listaNegocios: []
    });
    const setNegocio = (neg) => setState(prev => ({ ...prev, negocio: neg }));
    const setListaNegocios = (arr) => setState(p => ({ ...p, listaNegocios: arr }));
    const value = { state, setNegocio, setListaNegocios };
    return _jsx(AppContext.Provider, { value: value, children: children });
};
