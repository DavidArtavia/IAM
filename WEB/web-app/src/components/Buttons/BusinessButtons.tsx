import { useEffect } from 'react';
import { FILTER_STATUS } from '@/constants';
import {
  DTO_FiltroEstado,
  DTO_Negocio,
  DTO_Respuesta,
} from '@/models';
import { negocioService } from '@/services/negocios.service';
import {
  errorHelpers,
  procesarRespuesta,
} from '@/utils';
import { useApp } from '@/hooks/useApp';
import Select from "react-select";

export const BusinessButtons = () => {
  const { state, setNegocio, setListaNegocios } = useApp();
  const { listaNegocios, negocio } = state;


  useEffect(() => {
    if (listaNegocios.length) return;  

    const filtro: DTO_FiltroEstado = { filtroEstado: FILTER_STATUS.ACTIVO };

    const sub = negocioService.obtenerNegocios(filtro).subscribe({
      next: (result) => {
        const arr = procesarRespuesta(result as DTO_Respuesta) as DTO_Negocio[];
        setListaNegocios(arr);        
        if (!negocio && arr.length) {
          setNegocio(arr[0]);           
        }
      },
      error: (err) => errorHelpers.serverError(err),
    });

    return () => sub.unsubscribe();
  }, [listaNegocios]);  

const opcionesNegocios = listaNegocios.map((b) => ({
  value: b.iD_Negocio,
  label: b.nombreNegocio,
}));

  return (
    <div className="container py-3" style={{ paddingLeft: 0 }}>
      <div className="row gx-0">
        <div className="col-12 col-lg-3">
          <Select
            className="basic-single"
            classNamePrefix="select"
            isDisabled={listaNegocios.length === 0}
            isClearable={false}
            placeholder={
              listaNegocios.length === 0
                ? "Sin negocios creados"
                : "Seleccione un negocio"
            }
            value={
              negocio
                ? { value: negocio.iD_Negocio, label: negocio.nombreNegocio }
                : null
            }
            onChange={(opcion) => {
              const id = opcion?.value;
              const seleccionado =
                listaNegocios.find((n) => n.iD_Negocio === id) ?? null;
              setNegocio(seleccionado);
            }}
            options={opcionesNegocios}
          />
        </div>
      </div>
    </div>
  );
};
