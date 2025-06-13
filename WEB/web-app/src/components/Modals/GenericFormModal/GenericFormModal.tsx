import { useGenericForm } from "@/hooks/useGenericForm";
import { FieldConfig } from "./types";

interface GenericFormModalProps<T> {
  title: string;
  show: boolean;
  onHide: () => void;
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  onSubmit: () => void; // Callback original para enviar
  fields: Array<FieldConfig<T>>;
}

/**
 * Modal genérico para creación/edición de entidades.
 * Soporta inputs custom, textarea, select, number, text y date.
 * Los date inválidos (null o <1753) se inicializan con hoy.
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
  // 2) Hook interno: validación, manejo display local y submit interceptado
  const {
    errors,
    touched,
    localDisplay,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useGenericForm(data, setData, fields, show, onSubmit);

  if (!show) return null;

  // 3) Renderizado según tipo de campo
  const renderField = (field: FieldConfig<T>, idx: number) => {
    const { key, label, type = "text", options, renderer } = field;
    const rawVal = (data as any)[key];
    const localVal = localDisplay[key];
    const isTouched = touched[key];
    const errorMsg = isTouched ? errors[key] : "";

    const inputClass = `form-control form-control-solid ${
      errorMsg
        ? "is-invalid"
        : isTouched && (localVal ?? rawVal)
        ? "is-valid"
        : ""
    }`;

    const wrapperClass =
      idx < 2 ? "col-md-6 fv-row" : "d-flex flex-column mb-5 fv-row";
    const labelClass =
      idx < 2
        ? "required fs-5 fw-bold mb-2"
        : "required fs-5 fw-bold mb-2 mt-6";

    let element: React.ReactNode;

    if (type === "custom" && renderer) {
      element = renderer({
        value: rawVal,
        onChange: (val) => {
          setData({ ...data, [key]: val as any });
          handleBlur(key);
        },
      });
    } else if (type === "textarea") {
      element = (
        <textarea
          id={String(key)}
          className={inputClass}
          value={String(rawVal ?? "")}
          onChange={(e) => handleChange(key, e.target.value, "text")}
          onBlur={() => handleBlur(key)}
        />
      );
    } else if (type === "select") {
      element = (
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
      );
    } else if (type === "date") {
      const today = new Date().toISOString().slice(0, 10);
      const rawDate = rawVal ? new Date(String(rawVal)) : null;
      const valid =
        rawDate instanceof Date &&
        !isNaN(rawDate.getTime()) &&
        rawDate.getFullYear() >= 1753;
      const dateVal = valid ? rawDate.toISOString().slice(0, 10) : null;
      element = (
        <input
          id={String(key)}
          type="date"
          className={inputClass}
          value={dateVal ?? ""}
          onChange={(e) => handleChange(key, e.target.value, "date")}
          onBlur={() => handleBlur(key)}
        />
      );
    } else {
      element = (
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
      );
    }

    return (
      <div className={wrapperClass} key={String(key)}>
        <label htmlFor={String(key)} className={labelClass}>
          {label}
        </label>
        {element}
        {errorMsg ? (
          <div className="invalid-feedback">{errorMsg}</div>
        ) : isTouched && (localVal ?? rawVal) ? (
          <div className="valid-feedback">¡Perfecto!</div>
        ) : null}
      </div>
    );
  };

  // 4) Estructura general del modal
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
