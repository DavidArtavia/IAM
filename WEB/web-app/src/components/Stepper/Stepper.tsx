import { DTO_Param } from "@/models";
import { notificationHelpers } from "@/utils";
import { useState } from "react";

type Step = {
  title: string;
  validator?: () => DTO_Param[];
  description?: string;
  renderer?: React.ReactNode;
  children?: React.ReactNode;
};

interface StepperProps {
  steps: Step[];
  onSubmit?: () => void;
  setErroresValidacion?: (errs: DTO_Param[]) => void; // <-- Añade esto
  focusByErrKey?: (key: string) => void;
}

export const Stepper = ({ steps, onSubmit, setErroresValidacion, focusByErrKey }: StepperProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const goNext = () => {

     const currentValidator = steps[currentStep]?.validator;

  if (currentValidator) {
    // Ejecuta la validación
    const errors = currentValidator();

    if (errors.length > 0) {
      // Hay errores, no avanzamos
      // Aquí debes pasar los errores al formulario para que se muestren
      // Si tu Stepper no tiene acceso a `setErroresValidacion`, debes pasarlo como prop
      if (setErroresValidacion) {
        setErroresValidacion(errors);
      }
      notificationHelpers.warningAlert("Por favor corrige los errores antes de continuar.");
      
      // Opcional: Hacer scroll al primer error
      if (errors[0] && focusByErrKey) {
        focusByErrKey(errors[0].nombre); // Asegúrate de que `focusByErrKey` esté disponible
      }

      return; // Detenemos la ejecución aquí
    }
  }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onSubmit?.();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="custom-stepper">
      {/* Stepper Nav */}
      <div className="stepper-nav">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`stepper-item ${
              index === currentStep ? "current" : ""
            } ${index < currentStep ? "completed" : ""}`}
          >
            <div className="stepper-icon">
              {index < currentStep ? (
                <i className="stepper-check fas fa-check"></i>
              ) : (
                <span className="stepper-number">{index + 1}</span>
              )}
            </div>
            <div
              className={`stepper-label ${
                index < currentStep ? "stepper-label-completed" : ""
              }`}
            >
              <h3
                className="stepper-title"
                style={{
                  color: index < currentStep ? "#99A1B7" : "#78829D",
                }}
              >
                {step.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="stepper-content">{steps[currentStep].renderer}</div>

      {/* Buttons */}
      <div className="stepper-actions">
        <button
          type="button"
          className="btn btn-light btn-active-light-primary"
          onClick={goBack}
          disabled={currentStep === 0}
        >
          Atrás
        </button>
          {steps[currentStep].children}
        <button type="button" className="btn btn-primary" onClick={goNext}>
          {currentStep === steps.length - 1 ? "Guardar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
};
