// src/components/AsyncTarifaSelect.tsx
import { useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import {
  DTO_Respuesta,
  DTO_SolicitudDeBusqueda,
  DTO_Negocio,
  DTO_Proforma,
} from "@/models";
import { errorHelpers, procesarRespuesta } from "@/utils";
import { useDebouncedPromise } from "@/hooks";
import { STATUS_TBL } from "@/constants";
import { tarifasService } from "@/services/tarifas.service";
import { proformaService } from "@/services/proformas.service";

export interface ProformaOption {
  proforma: DTO_Proforma;
  label: string;
  value: number;
}

type Props = {
  value: ProformaOption | null;
  onChange: (opt: ProformaOption | null) => void;
  reloadKey?: number;
  negocio: DTO_Negocio;
};

export const AsyncProformaSelect = ({
  value,
  onChange,
  reloadKey = 0,
  negocio,
}: Props) => {
  const [tarifas, setTarifas] = useState<DTO_Proforma[]>(() => []);

  useEffect(() => {
    const sub = tarifasService.obtenerTarifas(negocio).subscribe({
      next: (result) => {
        const parsed =
          (procesarRespuesta(
            result as unknown as DTO_Respuesta
          ) as DTO_Proforma[]) || [];
        setTarifas(parsed);
      },
      error: (err) => errorHelpers.serverError(err),
    });
    return () => sub.unsubscribe?.();
  }, [reloadKey, negocio]);

  const activeTarifas = useMemo(
    () =>
      tarifas.filter((t) => t.estado?.iD_Estado !== STATUS_TBL.CLIENT.DELETED),
    [tarifas]
  );

  // este viene del obtenerTarifas
  const recentOptions: ProformaOption[] = useMemo(
    () =>
      activeTarifas.map((p) => ({
        proforma: p,
        value: p.iD_Proforma ?? 0, // <-- valor único
        label: `${p.cliente?.nombreCliente} | ₡${Number(p.totalCalculado).toLocaleString(
          "es-CR"
        )}`,
      })),
    [activeTarifas]
  );

  const loadOptions = async (input: string): Promise<ProformaOption[]> => {
    if (!input || input.trim().length < 3) return [];
    const solicitud: DTO_SolicitudDeBusqueda = { term: input.trim(), negocio };

    const list = await proformaService.buscarProformas(solicitud).toPromise();
    return (list ?? [])
      .filter((p) => p.estado?.iD_Estado !== STATUS_TBL.TARIFF.DELETED)
      .map((p) => ({
        proforma: p,
        value: p.iD_Proforma ?? 0, // <-- valor único
        label: `${p.cliente?.nombreCliente} | ₡${Number(p.totalCalculado).toLocaleString(
          "es-CR"
        )}`,
      }));
  };

  const debouncedPromiseLoad = useDebouncedPromise(loadOptions, 300);

  return (
    <AsyncSelect<ProformaOption, false>
      cacheOptions
      defaultOptions={recentOptions}
      loadOptions={debouncedPromiseLoad}
      onChange={onChange}
      value={value}
      placeholder="Buscar proforma..."
      noOptionsMessage={() => "Escribe al menos 3 caracteres"}
      isMulti={false}
      getOptionValue={(opt) => String(opt.value)}
      getOptionLabel={(opt) => opt.label}
    />
  );
};
