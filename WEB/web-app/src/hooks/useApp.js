import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx)
        throw new Error('useApp debe usarse dentro de <AppProvider>');
    return ctx;
};
