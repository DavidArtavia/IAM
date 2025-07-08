import { jsx as _jsx } from "react/jsx-runtime";
// src/components/AsyncClientSelect.tsx
import { useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import { clientesService } from "@/services";
import { errorHelpers, procesarRespuesta } from "@/utils";
import { useDebouncedPromise } from "@/hooks";
export const AsyncClientSelect = ({ value, onChange }) => {
    const [clients, setClients] = useState([]);
    // Al montar cargamos los más recientes
    useEffect(() => {
        clientesService.obtenerClientes().subscribe({
            next: (result) => setClients(procesarRespuesta(result) || []),
            error: (err) => errorHelpers.serverError(err),
        });
    }, []);
    const recentOptions = useMemo(() => clients.map((c) => ({
        value: c.iD_Cliente,
        label: `${c.nombreCliente} ${c.apellidoCliente}`,
    })), [clients]);
    // 1) Función que devuelve Promise<ClientOption[]>
    const loadPromise = async (input) => {
        if (input.length < 2)
            return [];
        const list = await clientesService.buscarClientes(input).toPromise();
        return (list ?? []).map((c) => ({
            value: c.iD_Cliente,
            label: `${c.nombreCliente} ${c.apellidoCliente}`,
        }));
    };
    // Aplica debounce sobre la promesa
    const debouncedPromiseLoad = useDebouncedPromise(loadPromise, 300);
    return (_jsx(AsyncSelect, { cacheOptions: true, defaultOptions: recentOptions, loadOptions: debouncedPromiseLoad, onChange: onChange, value: value, placeholder: "Buscar cliente...", noOptionsMessage: () => "Escribe al menos 3 caracteres" }));
};
