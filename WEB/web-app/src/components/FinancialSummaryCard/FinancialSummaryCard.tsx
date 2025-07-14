type Props = {
  title?: string;
  HighlightedTitleAtStart?: string;
  HighlightedTitleAtEnd?: string;
  onClick?: () => void;
  icon?: string;
  value?: string; // valor principal
  secondaryValue?: string; // valor secundario
  isLoading?: boolean;
  href?: string;
  styleType?: string;
};

export const FinancialSummaryCard = ({
  title,
  HighlightedTitleAtEnd = "",
  HighlightedTitleAtStart = "",
  value,
  icon,
  //   onClick,
  isLoading = false,
  href,
  styleType: textType = "info",
  secondaryValue,
}: Props) => {
  if (isLoading) {
    return (
      <div
        className="col bg-light-info px-6 py-8 rounded-2 me-7 mb-7 d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: 180 }}
      >
        <div
          className="spinner-border text-info"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="fw-bold fs-6 mt-3 text-info">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <div className={`col bg-light-${textType} px-6 py-8 rounded-2 me-7 mb-7`}>
        <span className="svg-icon svg-icon-3x svg-icon-warning d-block my-2">
          <i
            className={`bi ${icon} text-${textType}`}
            style={{ fontSize: "xx-large" }}
          ></i>
        </span>

        <a href={href} className={`text-${textType} text-nowrap`}>
          {HighlightedTitleAtEnd ? (
            <>
              <span className="fw-bold fs-6">{title}</span>
              <span className="fw-bolder fs-2">{HighlightedTitleAtEnd}</span>
            </>
          ) : (
            <>
              <span className="fw-bolder fs-2">{HighlightedTitleAtStart}</span>{" "}
              <span className="fw-bold fs-6">{title}</span>
            </>
          )}
        </a>
        <div className={`fw-bolder fs-1 text-${textType}`}>
          {value}{" "}
          {secondaryValue && (
            <span className="fw-bold fs-6">{secondaryValue}</span>
          )}
        </div>
      </div>
    </>
  );
};
