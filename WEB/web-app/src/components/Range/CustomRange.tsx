import { useRef, useEffect, useState } from "react";

type Props = {
  data: any[]; // Estructura que usás
  onChange?: (value: number) => void;
};

export const CustomRange = ({ data, onChange }: Props) => {
  const value = Number(data?.[0] ?? 0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [bubbleLeft, setBubbleLeft] = useState(0);
  const [bubbleBelow, setBubbleBelow] = useState(false);

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      const { width } = slider.getBoundingClientRect();
      const percentage = value / 100;
      const thumbWidth = 18; // Ancho del thumb (5% del ancho total)
      const offset = percentage * (width - thumbWidth) + thumbWidth ;
      setBubbleLeft(offset);

      // Si está muy a la izquierda o derecha, bajamos la burbuja
      setBubbleBelow(value <= 13 );
    }
  }, [value]);

  return (
    <div className="position-relative w-100 px-3 pt-2 pb-5">
      {/* Bubble */}
      <div
        className={`position-absolute translate-middle-x shadow d-flex flex-column align-items-center justify-content-center bubble ${
          bubbleBelow ? "bubble-bottom" : "bubble-top"
        }`}
        style={{
          top: bubbleBelow ? "40px" : "-53px",
          left: `${bubbleLeft}px`,
          width: "60px",
          height: "60px",
          backgroundColor: "rgba(250, 250, 250, 0.13)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "50%",
        }}
      >
        <div className="text-primary fw-bold fs-5 lh-1">{value}%</div>
      </div>

      {/* Slider */}
      <input
        ref={sliderRef}
        type="range"
        className="form-range custom-slider"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={
          onChange ? (e) => onChange(Number(e.target.value)) : undefined
        }
      />

      {/* Etiquetas */}
      <div className="d-flex justify-content-between text-muted small mt-1">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
};
