import { useGenericForm } from "@/hooks/useGenericForm";
import { FieldConfig } from "./types";
import { DynamicButtonConfig, ModalHeaderButtons } from "@/components";

//#region INTERFACES
interface GenericFormModalProps<T> {
  title: string;
  show: boolean;
  onHide: () => void;
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  onSubmit: () => void;
  fields: Array<FieldConfig<T>>;
  headerButtons?: DynamicButtonConfig[];
}
//#endregion

//#region COMPONENT
export const GenericFormModal = <T,>({
  title,
  show,
  onHide,
  data,
  setData,
  onSubmit,
  fields,
  headerButtons,  
}: GenericFormModalProps<T>) => {
  //#region HOOKS
  const {
    errors,
    touched,
    wasSubmitted,
    localDisplay,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useGenericForm(data, setData, fields, show, onSubmit);
  //#endregion

  if (!show) return null;

  //#region RENDER FIELD
  const renderField = (field: FieldConfig<T>, idx: number) => {
    const { key, label, type = "text", options, renderer, readOnly } = field;
    const rawVal = (data as any)[key];
    const localVal = localDisplay[key];
    const shouldShowError = touched[key] || wasSubmitted;
    const errorMsg = shouldShowError ? errors[key] : "";

    const inputClass = `form-control  ${errorMsg ? "is-invalid" : ""}`;
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
      (field.required ? "required " : "") +
      (idx < 2
      ? "fs-5 fw-bold mb-2"
      : "fs-5 fw-bold mb-2 mt-6");

    //#region READ-ONLY LABEL
    if (readOnly) {
      //#region RENDER TO ESTADOS
      if (typeof rawVal === "object" && rawVal !== null && "nombre" in rawVal) {
        const nombre = String((rawVal as any).nombre).toLowerCase();
        const badgeMap: Record<string, string> = {
          activo: "badge-light-success",
          nuevo: "badge badge-secondary",
          "en proceso": "badge-light-primary",
          "en espera": "badge-light-warning",
          completado: "badge-light-success",
          eliminado: "badge-light-danger",
          inactivo: "badge-light-light",
          default: "badge badge-dark",
        };
        const badgeClass = badgeMap[nombre] ?? badgeMap.default;

        return (
          <div className={wrapperClass} key={String(key)}>
            <label className={labelClass}>
              {label}:{" "}
              <span className={badgeClass}>{(rawVal as any).nombre}</span>
            </label>
          </div>
        );
      }
      //#endregion
      return (
        <div className={wrapperClass + " mb-3 "} key={String(key)}>
          <label className={labelClass}>
            {label}:{" "}
            <span className="text-muted fw-semibold">
              {String(rawVal ?? "–")}
            </span>
          </label>
        </div>
      );
    }
    //#endregion

    //#region TYPE CUSTOM
    if (type === "custom" && renderer) {
      return (
        <div className={wrapperClass} key={String(key)}>
          <label htmlFor={String(key)} className={labelClass}>
            {label}
          </label>
          {renderer({
            value: rawVal,
            onChange: (val) => {
              setData((prev) => ({ ...prev, [key]: val }));
            },
            onBlur: () => handleBlur(key),
          })}

          {errorMsg && (
            <div className="invalid-feedback d-block">
              {typeof field.errorMessage === "function"
                ? field.errorMessage(rawVal)
                : field.errorMessage || errorMsg}
            </div>
          )}
        </div>
      );
    }
    //#endregion

    //#region TYPE TEXTAREA
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
          {errorMsg && (
            <div className="invalid-feedback d-block">
              {typeof field.errorMessage === "function"
                ? field.errorMessage(rawVal)
                : field.errorMessage || errorMsg}
            </div>
          )}
        </div>
      );
    }
    //#endregion

    //#region TYPE SELECT
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
          {errorMsg && (
            <div className="invalid-feedback d-block">
              {typeof field.errorMessage === "function"
                ? field.errorMessage(rawVal)
                : field.errorMessage || errorMsg}
            </div>
          )}
        </div>
      );
    }
    //#endregion

    //#region TYPE DATE
    if (type === "date") {
      const parsed = rawVal ? new Date(String(rawVal)) : null;
      const valid =
        parsed instanceof Date &&
        !isNaN(parsed.getTime()) &&
        parsed.getFullYear() >= 1753;
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
          {errorMsg && (
            <div className="invalid-feedback d-block">
              {typeof field.errorMessage === "function"
                ? field.errorMessage(rawVal)
                : field.errorMessage || errorMsg}
            </div>
          )}
        </div>
      );
    }
    //#endregion

    //#region DEFAULT TEXT/NUMBER
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
        {errorMsg && (
          <div className="invalid-feedback d-block">
            {typeof field.errorMessage === "function"
              ? field.errorMessage(rawVal)
              : field.errorMessage || errorMsg}
          </div>
        )}
      </div>
    );
    //#endregion
  };
  //#endregion

  //#region RENDER MODAL
  return (
    <div
      className="modal fade show d-block shadowDarkBackground"
      onClick={onHide}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content card card-custom example example-compact">
          <div className="card-header">
            <h3 className="card-title">{title}</h3>
            <div className="card-toolbar">
              {headerButtons && headerButtons.length > 0 && (
                <ModalHeaderButtons buttons={headerButtons} />
              )}
              <button
                type="button"
                className="btn btn-sm btn-icon btn-active-color-primary"
                onClick={onHide}
              >
                ✕
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="form"
          >
            <div className="card-body">
              {[...fields]
                .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
                .map((field, idx) => (
                  <div key={String(field.key)} className="col-12 mb-4">
                    {renderField(field, idx)}
                    <div className="separator separator-dashed my-5" />
                  </div>
                ))}
            </div>

            <div className="card-footer">
              <button
                type="submit"
                className="btn btn-primary me-3"
                disabled={Object.values(errors).some((e) => !!e)}
              >
                Guardar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHide}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  //#endregion
};
//#endregion
