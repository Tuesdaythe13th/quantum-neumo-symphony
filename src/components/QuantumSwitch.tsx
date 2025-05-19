
import React from "react";
import { cn } from "@/lib/utils";

interface QuantumSwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

const QuantumSwitch: React.FC<QuantumSwitchProps> = ({ 
  label, 
  value, 
  onChange,
  className 
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative inline-flex items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-quantum-accent",
          value ? "bg-quantum-accent" : "bg-quantum-light",
          "h-6 w-11"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full transition-transform duration-200",
            value ? "translate-x-6 bg-quantum-bg" : "translate-x-1 bg-quantum-muted",
            value && "shadow-quantum-glow"
          )}
        />
      </button>
    </div>
  );
};

export default QuantumSwitch;
