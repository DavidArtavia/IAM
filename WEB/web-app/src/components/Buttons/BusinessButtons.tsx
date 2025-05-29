import { DTO_Negocio, DTO_Respuesta } from '@/models';
import { chatService } from '@/services';
import { errorHelpers, procesarRespuesta } from '@/utils';
import { useEffect, useState } from 'react'

type Props = {
    title: string;
    selectedBusiness: DTO_Negocio | null;
    handleSelectBusiness: (business: DTO_Negocio) => void;
}

export const BusinessButtons = ({ title, selectedBusiness, handleSelectBusiness }: Props) => {

    const [businesses, setBusinesses] = useState<Array<DTO_Negocio>>([]);
    
    // 1) Cargo negocios al montar
    useEffect(() => {
        chatService.obtenerNegocios().subscribe({
            next: (result) =>
                setBusinesses(
                    procesarRespuesta(result as DTO_Respuesta) as Array<DTO_Negocio>
                ),
            error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
            complete: () => { },
        });
    }, []);
    return (
      <>
        <div className="card shadow-sm">
          <div className="card-header col-12">
            <span className="card-title text-gray-600">{title}</span>
          </div>
          <div className="card-body row">
            {businesses &&
              businesses.length > 0 &&
              businesses.map((bis: DTO_Negocio) => (
                <div className="col-4 p-2" key={bis.iD_Negocio}>
                  <button
                    className={`btn col-12 text-truncate w-100${
                      bis.iD_Negocio === selectedBusiness?.iD_Negocio
                        ? " btn-primary"
                        : " btn-secondary"
                    }`}
                    onClick={() => handleSelectBusiness(bis)}
                  >
                    {bis.nombreNegocio}
                  </button>
                </div>
              ))}

            <div
              className={`d-flex align-items-center rounded py-5 px-5 bg-light-warning${
                businesses.length > 0 ? " d-none" : " "
              }`}
            >
              <span className="svg-icon svg-icon-3x svg-icon-warning me-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <rect
                    opacity="0.3"
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="10"
                    fill="black"
                  ></rect>
                  <rect
                    x="11"
                    y="14"
                    width="7"
                    height="2"
                    rx="1"
                    transform="rotate(-90 11 14)"
                    fill="black"
                  ></rect>
                  <rect
                    x="11"
                    y="17"
                    width="2"
                    height="2"
                    rx="1"
                    transform="rotate(-90 11 17)"
                    fill="black"
                  ></rect>
                </svg>
              </span>

              <div className="text-gray-700 fw-bold fs-6">
                <code>Alerta</code>Aún no tiene negocios registrados, por favor
                dirigete a la opcion de negocio y registra tu primer negocio
              </div>
            </div>
          </div>
        </div>
      </>
    );
}