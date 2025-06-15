import { useGenericForm } from "@/hooks/useGenericForm";
import { FieldConfig } from "./types";

interface GenericFormModalProps<T> {
  title: string;
  show: boolean;
  onHide: () => void;
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  onSubmit: () => void;
  fields: Array<FieldConfig<T>>;
}

/**
 * Modal genérico para creación/edición de entidades.
 * Soporta:
 * - type="custom"   → renderer personalizado
 * - type="textarea"
 * - type="select"
 * - type="date"     → lógico: vacío si no hay fecha válida
 * - type="number"
 * - type="text"
 */
export const GenericFormModal = <T,>({
  title,
  show,
  onHide,
  data,
  setData,
  onSubmit,
  fields,
}: GenericFormModalProps<T>) => {
  const {
    errors,
    touched,
    wasSubmitted,
    localDisplay,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useGenericForm(data, setData, fields, show, onSubmit);

  if (!show) return null;

  const renderField = (field: FieldConfig<T>, idx: number) => {
    const { key, label, type = "text", options, renderer } = field;
    const rawVal = (data as any)[key];
    const localVal = localDisplay[key];
    const shouldShowError = touched[key] || wasSubmitted;
    const errorMsg = shouldShowError ? errors[key] : "";    
    const inputClass = `form-control form-control-solid ${
      errorMsg ? (
        <div className="invalid-feedback d-block">{errorMsg}</div>
      ) : null
    }`;
    const wrapperClass =
      type === "custom"
        ? idx < 2
          ? "col-md-6 fv-row"
          : "d-flex flex-column mb-5 fv-row"
        : type === "date"
        ? "d-flex flex-column mb-5 fv-row"
        : idx < 2
        ? "col-md-6 fv-row"
        : "d-flex flex-column mb-5 fv-row";
    const labelClass =
      idx < 2
        ? "required fs-5 fw-bold mb-2"
        : "required fs-5 fw-bold mb-2 mt-6";

    // ────────────────────────────────
    // 1) CUSTOM
    // ────────────────────────────────
    if (type === "custom" && renderer) {
      return (
        <div className={wrapperClass} key={String(key)}>
          <label htmlFor={String(key)} className={labelClass}>
            {label}
          </label>
          {renderer({
            value: rawVal,
            onChange: (val) => {
              setData({ ...data, [key]: val as any });
              handleBlur(key);
            },
          })}
          {errorMsg ? (
            <div className="invalid-feedback d-block">{errorMsg}</div>
          ) : null}
        </div>
      );
    }

    // ────────────────────────────────
    // 2) TEXTAREA
    // ────────────────────────────────
    if (type === "textarea") {
      return (
        <div className={wrapperClass} key={String(key)}>
          <label htmlFor={String(key)} className={labelClass}>
            {label}
          </label>
          <textarea
            id={String(key)}
            className={inputClass}
            value={String(rawVal ?? "")}
            onChange={(e) => handleChange(key, e.target.value, "text")}
            onBlur={() => handleBlur(key)}
          />
          {errorMsg ? (
            <div className="invalid-feedback d-block">{errorMsg}</div>
          ) : null}
        </div>
      );
    }

    // ────────────────────────────────
    // 3) SELECT
    // ────────────────────────────────
    if (type === "select") {
      return (
        <div className={wrapperClass} key={String(key)}>
          <label htmlFor={String(key)} className={labelClass}>
            {label}
          </label>
          <select
            id={String(key)}
            className={inputClass}
            value={String(rawVal ?? "")}
            onChange={(e) => handleChange(key, e.target.value, "select")}
            onBlur={() => handleBlur(key)}
            required
          >
            <option value="">– Seleccione –</option>
            {options?.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
          {errorMsg ? (
            <div className="invalid-feedback d-block">{errorMsg}</div>
          ) : null}
        </div>
      );
    }

    // ────────────────────────────────
    // 4) DATE (Vacío si no hay fecha válida)
    // ────────────────────────────────
    if (type === "date") {
      // Interpretar rawVal
      const parsed = rawVal ? new Date(String(rawVal)) : null;
      const valid =
        parsed instanceof Date &&
        !isNaN(parsed.getTime()) &&
        parsed.getFullYear() >= 1753;
      // Valor: primero lo que el usuario tipeó, si no, la ISO válida, sino cadena vacía
      const dateVal =
        localVal ?? (valid ? parsed.toISOString().slice(0, 10) : "");

      return (
        <div className={wrapperClass} key={String(key)}>
          <label htmlFor={String(key)} className={labelClass}>
            {label}
          </label>
          <input
            id={String(key)}
            type="date"
            className={inputClass}
            value={dateVal}
            onChange={(e) => handleChange(key, e.target.value, "date")}
            onBlur={() => handleBlur(key)}
          />
          {errorMsg ? (
            <div className="invalid-feedback d-block">{errorMsg}</div>
          ) : null}
        </div>
      );
    }

    // ────────────────────────────────
    // 5) NUMBER Y TEXT POR DEFECTO
    // ────────────────────────────────
    return (
      <div className={wrapperClass} key={String(key)}>
        <label htmlFor={String(key)} className={labelClass}>
          {label}
        </label>
        <input
          id={String(key)}
          type={type}
          className={inputClass}
          value={
            type === "number"
              ? String(localVal ?? rawVal ?? "")
              : String(rawVal ?? "")
          }
          onChange={(e) => handleChange(key, e.target.value, type)}
          onBlur={() => handleBlur(key)}
        />
        {errorMsg ? (
          <div className="invalid-feedback d-block">{errorMsg}</div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="modal fade show d-block shadowBackground" onClick={onHide}>
      <div
        className="modal-dialog modal-dialog-centered mw-650px"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2>{title}</h2>
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-color-primary"
              onClick={onHide}
            >
              ✕
            </button>
          </div>

          <div className="modal-body py-10 px-lg-17">
            <div className="row mb-5">{fields.map(renderField)}</div>
          </div>

          <div className="modal-footer flex-center">
            <button
              type="button"
              className="btn btn-light me-3"
              onClick={onHide}
            >
              Descartar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={Object.values(errors).some((e) => !!e)}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
