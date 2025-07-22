import { DTO_MetricaKPI } from "@/models";
import { useEffect } from "react";

interface KPIpropTypes {
  metrica: DTO_MetricaKPI;
}

export const KPI = ({ metrica }: KPIpropTypes) => {
  useEffect(() => {
    try {
      const popovers = Array.from(
        document.querySelectorAll<HTMLElement>('[data-bs-toggle="popover"]')
        //@ts-expect-error se ignora ya que actua directamente sobre los scripts del template
      ).map((el) => new bootstrap.Popover(el));

      return () => popovers.forEach((p) => p.dispose());
    } catch (error) {
      console.log(error);
    }
  }, [metrica]);

  return (
    <div
      className="col-xl-3 p-2"
      data-bs-toggle="popover"
      tabIndex={0}
      data-bs-trigger="focus"
      title="Información"
      data-bs-content={metrica.info}
    >
      <div className={metrica.bgColor + " py-8 rounded-2 p-5"}>
        <span className="svg-icon svg-icon-3x svg-icon-warning d-block my-2">
          <i
            className={"bi " + metrica.icono + " " + metrica.txtColor}
            style={{ fontSize: "xx-large" }}
          ></i>
        </span>
        <a className={"text-nowrap " + metrica.txtColor}>
          {metrica.ordenTitulos === "NR" ? (
            <>
              <span className="form-check-label fw-bolder fs-2 lbl">
                {metrica.tituloNegrita}{" "}
              </span>
              <span className="form-check-label fw-bold fs-6 lbl">
                {metrica.tituloRegular}{" "}
              </span>
            </>
          ) : (
            <>
              <span className="form-check-label fw-bold fs-6 lbl">
                {metrica.tituloRegular}{" "}
              </span>
              <span className="form-check-label fw-bolder fs-2 lbl">
                {metrica.tituloNegrita}{" "}
              </span>
            </>
          )}
        </a>

        <div className={"fw-bolder fs-1 " + metrica.txtColor}>
          {metrica.ordenValores === "NR" ? (
            <>
              {metrica.valorNegrita}
              <span className="fw-bold fs-6"> {metrica.valorRegular} </span>
            </>
          ) : (
            <>
              <span className="fw-bold fs-6"> {metrica.valorRegular} </span>
              {metrica.valorNegrita}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
