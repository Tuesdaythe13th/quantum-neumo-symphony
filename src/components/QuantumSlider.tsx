
import React from "react";
import { cn } from "@/lib/utils";

interface QuantumSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

const QuantumSlider: React.FC<QuantumSliderProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  unit = "",
  onChange,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm font-mono bg-quantum-light px-2 py-0.5 rounded-md">
          {value.toFixed(step < 1 ? 1 : 0)}
          {unit && <span className="text-quantum-muted ml-0.5">{unit}</span>}
        </span>
      </div>
      <div className="relative h-9 flex items-center cursor-pointer">
        <div className="w-full h-1.5 bg-quantum-light rounded-full overflow-hidden">
          <div
            className="h-full bg-quantum-accent"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
        />
        <div
          className="absolute h-4 w-4 rounded-full bg-quantum-accent shadow-quantum-glow pointer-events-none transform -translate-x-1/2"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default QuantumSlider;
