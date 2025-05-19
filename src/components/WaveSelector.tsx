
import React from "react";
import { cn } from "@/lib/utils";

type WaveType = "sine" | "square" | "triangle" | "sawtooth" | "quantumNoise";

interface WaveSelectorProps {
  value: WaveType;
  onChange: (value: WaveType) => void;
  className?: string;
}

const WaveSelector: React.FC<WaveSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const waves: { type: WaveType; label: string }[] = [
    { type: "sine", label: "Sine" },
    { type: "square", label: "Square" },
    { type: "triangle", label: "Triangle" },
    { type: "sawtooth", label: "Saw" },
    { type: "quantumNoise", label: "Quantum" },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">Waveform</label>
      <div className="grid grid-cols-5 gap-1">
        {waves.map((wave) => (
          <button
            key={wave.type}
            onClick={() => onChange(wave.type)}
            className={cn(
              "relative p-2 text-xs rounded-md transition-all duration-200",
              value === wave.type
                ? "neumorph-active text-quantum-glow"
                : "neumorph text-white"
            )}
          >
            <div className="h-10 w-full mb-1 overflow-hidden flex items-center justify-center">
              <WaveformIcon type={wave.type} active={value === wave.type} />
            </div>
            {wave.label}
          </button>
        ))}
      </div>
    </div>
  );
};

interface WaveformIconProps {
  type: WaveType;
  active: boolean;
}

const WaveformIcon: React.FC<WaveformIconProps> = ({ type, active }) => {
  const color = active ? "#9b87f5" : "#4c4d6e";

  const renderPath = () => {
    const width = 36;
    const height = 36;
    const padding = 4;
    const effectiveHeight = height - padding * 2;
    const effectiveWidth = width - padding * 2;
    
    switch (type) {
      case "sine":
        return (
          <path
            d={`M${padding} ${height / 2} 
                C${width * 0.25} ${padding} ${width * 0.25} ${height - padding} 
                ${width / 2} ${height / 2} 
                C${width * 0.75} ${padding} ${width * 0.75} ${height - padding} 
                ${width - padding} ${height / 2}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        );
      case "square":
        return (
          <path
            d={`M${padding} ${height / 2} 
                H${width / 2 - padding} 
                V${padding} 
                H${width / 2 + padding} 
                V${height / 2} 
                H${width - padding}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        );
      case "triangle":
        return (
          <path
            d={`M${padding} ${height / 2} 
                L${width / 4} ${padding} 
                L${width / 2} ${height / 2} 
                L${width * 3 / 4} ${height - padding} 
                L${width - padding} ${height / 2}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        );
      case "sawtooth":
        return (
          <path
            d={`M${padding} ${height / 2} 
                L${width / 2 - padding} ${padding} 
                V${height - padding} 
                L${width - padding} ${height / 2}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        );
      case "quantumNoise":
        // Generate random quantum-inspired noise
        const segments = 12;
        const segmentWidth = effectiveWidth / segments;
        
        let path = `M${padding} ${height / 2}`;
        
        for (let i = 1; i <= segments; i++) {
          const x = padding + i * segmentWidth;
          // Use deterministic but "random-looking" y values
          const heightVariation = Math.sin(i * 0.7) * Math.cos(i * 1.3) * effectiveHeight * 0.4;
          const y = height / 2 + heightVariation;
          path += ` L${x} ${y}`;
        }
        
        return (
          <>
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            {/* Add quantum dots for style */}
            {[2, 5, 8, 11].map((i) => (
              <circle
                key={i}
                cx={padding + i * segmentWidth}
                cy={height / 2 + Math.sin(i * 0.7) * Math.cos(i * 1.3) * effectiveHeight * 0.4}
                r="2"
                fill={active ? "#c4b5fd" : "#6b7280"}
              />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg width="36" height="36" viewBox="0 0 36 36">
      {renderPath()}
    </svg>
  );
};

export default WaveSelector;
