
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface QuantumKnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const QuantumKnob: React.FC<QuantumKnobProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  unit = "",
  onChange,
  className,
  size = "md",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const normalizedValue = (value - min) / (max - min);
  const rotation = normalizedValue * 270 - 135; // -135deg to 135deg rotation range

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartValue(value);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaY = startY - e.clientY;
    const sensitivity = (max - min) / 200;
    const newValue = Math.min(max, Math.max(min, startValue + deltaY * sensitivity));
    onChange(step ? Math.round(newValue / step) * step : newValue);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const deltaY = startY - e.touches[0].clientY;
    const sensitivity = (max - min) / 200;
    const newValue = Math.min(max, Math.max(min, startValue + deltaY * sensitivity));
    onChange(step ? Math.round(newValue / step) * step : newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
      document.body.style.userSelect = "";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        ref={knobRef}
        className={cn(
          "rounded-full bg-quantum-light relative cursor-grab",
          isDragging ? "cursor-grabbing knob-shadow-active" : "knob-shadow",
          sizeClasses[size]
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isDragging ? "none" : "transform 0.1s ease-out",
        }}
      >
        <div className="absolute top-1/6 left-1/2 h-1/3 w-1 bg-quantum-accent rounded-full -translate-x-1/2 origin-bottom"></div>
        <div className="absolute inset-0 rounded-full border-2 border-quantum-accent opacity-20"></div>
      </div>
      <div className="text-center mt-2 space-y-1">
        <div className="text-xs text-quantum-glow font-medium">{label}</div>
        <div className="text-xs font-mono bg-quantum-light px-2 py-1 rounded-md">
          {value.toFixed(step < 1 ? 1 : 0)}
          {unit && <span className="text-quantum-muted ml-0.5">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default QuantumKnob;
