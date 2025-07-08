import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { FILTER_STATUS } from '@/constants';
import { negocioService } from '@/services/negocios.service';
import { errorHelpers, procesarRespuesta, } from '@/utils';
import { useApp } from '@/hooks/useApp';
export const BusinessButtons = () => {
    const { state, setNegocio, setListaNegocios } = useApp();
    const { listaNegocios, negocio } = state;
    useEffect(() => {
        if (listaNegocios.length)
            return;
        const filtro = { filtroEstado: FILTER_STATUS.ACTIVO };
        const sub = negocioService.obtenerNegocios(filtro).subscribe({
            next: (result) => {
                const arr = procesarRespuesta(result);
                setListaNegocios(arr);
                if (!negocio && arr.length) {
                    setNegocio(arr[0]);
                }
            },
            error: (err) => errorHelpers.serverError(err),
        });
        return () => sub.unsubscribe();
    }, [listaNegocios]);
    return (_jsx("div", { className: "container py-3", style: { paddingLeft: 0 }, children: _jsx("div", { className: "row gx-0", children: _jsx("div", { className: "col-12 col-lg-3", children: _jsx("select", { "data-control": "select2", className: "form-control form-control-solid", disabled: listaNegocios.length === 0, value: negocio?.iD_Negocio ?? '', onChange: (e) => {
                        const id = Number(e.target.value);
                        setNegocio(listaNegocios.find(n => n.iD_Negocio === id) ?? null);
                    }, children: listaNegocios.length === 0 ? (_jsx("option", { value: "", disabled: true, children: "Sin negocios creados" })) : (_jsxs(_Fragment, { children: [!negocio && (_jsx("option", { value: "", disabled: true, children: "Seleccione un negocio" })), listaNegocios.map(b => (_jsx("option", { value: b.iD_Negocio, children: b.nombreNegocio }, b.iD_Negocio)))] })) }) }) }) }));
};
