
import React from "react";
import { cn } from "@/lib/utils";
import { SpectralMode } from "./QuantumControls";

interface SpectralMappingSelectorProps {
  value: SpectralMode;
  onChange: (value: SpectralMode) => void;
  className?: string;
}

const SpectralMappingSelector: React.FC<SpectralMappingSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const mappingOptions: { type: SpectralMode; label: string; description: string }[] = [
    { 
      type: "freq_qubits", 
      label: "Frequency → Qubits", 
      description: "Maps audio frequencies to qubit states"
    },
    { 
      type: "amp_phase", 
      label: "Amplitude → Phase", 
      description: "Maps audio amplitudes to quantum phases"
    },
    { 
      type: "harm_ent", 
      label: "Harmonic → Entanglement", 
      description: "Maps harmonic relationships to quantum entanglement"
    },
    { 
      type: "qpixl_bi", 
      label: "QPIXL Bidirectional", 
      description: "Full bidirectional quantum-image mapping"
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">Spectral Mapping</label>
      <div className="grid grid-cols-2 gap-2">
        {mappingOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => onChange(option.type)}
            className={cn(
              "relative p-2 text-xs rounded-md transition-all duration-200",
              value === option.type
                ? "neumorph-active text-quantum-glow"
                : "neumorph text-white"
            )}
          >
            <div className="mb-1 font-medium">{option.label}</div>
            <div className="text-[10px] opacity-70">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpectralMappingSelector;
