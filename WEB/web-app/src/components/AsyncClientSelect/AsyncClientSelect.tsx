// src/components/AsyncClientSelect.tsx
import  {  useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import { clientesService } from "@/services";
import { DTO_Cliente, DTO_Respuesta } from "@/models";
import { errorHelpers, procesarRespuesta } from "@/utils";
import { useDebouncedPromise } from "@/hooks";
import { STATUS_TBL } from "@/constants";

export interface ClientOption {
  value: number;
  label: string;
}

interface Props {
  value: ClientOption | null;
  onChange: (opt: ClientOption | null) => void;
  reloadKey?: number;
}



export const AsyncClientSelect = ({ value, onChange, reloadKey = 0 }: Props) => {
  const [clients, setClients] = useState<DTO_Cliente[]>([]);

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
  }, [reloadKey]);

  const activeClients = clients.filter(
    (c) => c.estado?.iD_Estado !== STATUS_TBL.CLIENT.DELETED
  );

  const recentOptions: ClientOption[] = useMemo(
    () =>
      activeClients.map((c) => ({
        value: c.iD_Cliente,
        label: `${c.nombreCliente} ${c.apellidoCliente}`,
      })),
    [activeClients]
  );

  const loadPromise = async (input: string): Promise<ClientOption[]> => {
    if (input.length < 3) return [];
    const list = await clientesService.buscarClientes(input).toPromise();
    return (list ?? [])
      .filter((c) => c.estado?.iD_Estado !== STATUS_TBL.CLIENT.DELETED)
      .map((c) => ({
        value: c.iD_Cliente,
        label: `${c.nombreCliente} ${c.apellidoCliente}`,
      }));
  };

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
