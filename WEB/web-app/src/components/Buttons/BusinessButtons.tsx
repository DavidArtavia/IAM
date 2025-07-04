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


  return (
    <div className="container py-3" style={{ paddingLeft: 0 }}>
      <div className="row gx-0">
        <div className="col-12 col-lg-3">
          <select
            className="form-select"
            disabled={listaNegocios.length === 0}
            value={negocio?.iD_Negocio ?? ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              setNegocio(listaNegocios.find(n => n.iD_Negocio === id) ?? null);
            }}
          >
            {listaNegocios.length === 0 ? (
              <option value="" disabled>Sin negocios creados</option>
            ) : (
              <>
                {!negocio && (                         
                  <option value="" disabled>
                    Seleccione un negocio
                  </option>
                )}
                {listaNegocios.map(b => (
                  <option key={b.iD_Negocio} value={b.iD_Negocio}>
                    {b.nombreNegocio}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  );
};
