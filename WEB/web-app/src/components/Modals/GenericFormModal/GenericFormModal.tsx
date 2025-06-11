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
    localDisplay,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useGenericForm(data, setData, fields, show, onSubmit);

  if (!show) return null;

  const renderField = (field: FieldConfig<T>, idx: number) => {
    const { key, label, type = "text", options, renderer } = field;
    const rawVal = data[key];
    const displayVal =
      type === "number" || type === "date"
        ? localDisplay[key] ?? ""
        : rawVal != null
        ? String(rawVal)
        : "";
    const isTouched = touched[key];
    const errorMsg = isTouched ? errors[key] : "";
    const inputClass = `form-control form-control-solid ${
      errorMsg ? "is-invalid" : isTouched && displayVal ? "is-valid" : ""
    }`;

    const baseProps = {
      id: String(key),
      className: inputClass,
      value: displayVal,
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => handleChange(key, e.target.value, type),
      onBlur: () => handleBlur(key),
    };

    let element;
    // **1) Caso custom: delegamos al renderer**
    if (type === "custom" && renderer) {
      element = renderer({
        value: data[key],
        onChange: (opt: unknown) => {
          setData({ ...data, [key]: opt as T[typeof key] });
          handleBlur(key);
        },
      });

    // 2) textarea
    } else if (type === "textarea") {
      element = <textarea {...baseProps} />;

    // 3) select normal
    } else if (type === "select") {
      element = (
        <select {...baseProps}>
          <option value="">– Seleccione –</option>
          {options?.map(opt => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    // 4) input text|number|date
    } else {
      element = <input type={type} {...(baseProps)} />;
    }

  const wrapperClass =
    idx < 2 ? "col-md-6 fv-row" : "d-flex flex-column mb-5 fv-row";
  const labelClass =
    idx < 2
      ? "required fs-5 fw-bold mb-2"
      : "required fs-5 fw-bold mb-2 mt-6";


    return (
      <div className={wrapperClass} key={String(key)}>
        <label htmlFor={String(key)} className={labelClass}>
          {label}
        </label>
        {element}
        {errorMsg ? (
          <div className="invalid-feedback">{errorMsg}</div>
        ) : isTouched && displayVal ? (
          <div className="valid-feedback">¡Perfecto!</div>
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
