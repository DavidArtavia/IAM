// src/components/AsyncClientSelect.tsx
import  {  useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import { clientesService } from "@/services";
import { DTO_Cliente, DTO_Respuesta } from "@/models";
import { errorHelpers, procesarRespuesta } from "@/utils";
import { useDebouncedPromise } from "@/hooks";

export interface ClientOption {
  value: number;
  label: string;
}

interface Props {
  value: ClientOption | null;
  onChange: (opt: ClientOption | null) => void;
}



export const AsyncClientSelect = ({ value, onChange }: Props) => {
  const [clients, setClients] = useState<DTO_Cliente[]>([]);
  // Al montar cargamos los más recientes
  useEffect(() => {
    clientesService.obtenerClientes().subscribe({
      next: (result) =>
        setClients(
          (procesarRespuesta(
            result as unknown as DTO_Respuesta
          ) as DTO_Cliente[]) || []
        ),
      error: (err) => errorHelpers.serverError(err),
    });
  }, []);
  
  const recentOptions: ClientOption[] = useMemo(
    () =>
      clients.map((c) => ({
        value: c.iD_Cliente,
        label: `${c.nombreCliente} ${c.apellidoCliente}`,
      })),
    [clients]
  );

    // 1) Función que devuelve Promise<ClientOption[]>
  const loadPromise = async (input: string): Promise<ClientOption[]> => {
    if (input.length < 2) return [];
    const list = await clientesService.buscarClientes(input).toPromise();
    return (list ?? []).map((c) => ({
      value: c.iD_Cliente,
      label: `${c.nombreCliente} ${c.apellidoCliente}`,
    }));
  };

  // Aplica debounce sobre la promesa
  const debouncedPromiseLoad = useDebouncedPromise(loadPromise, 300);
  return (
    <AsyncSelect<ClientOption, false>
      cacheOptions
      defaultOptions={recentOptions}
      loadOptions={debouncedPromiseLoad}
      onChange={onChange}
      value={value}
      placeholder="Buscar cliente..."
      noOptionsMessage={() => "Escribe al menos 3 caracteres"}
    />
  );
};
