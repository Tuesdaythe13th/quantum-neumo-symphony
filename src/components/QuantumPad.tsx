
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface QuantumPadProps {
  className?: string;
  onChange: (x: number, y: number) => void;
  xLabel?: string;
  yLabel?: string;
  initialX?: number;
  initialY?: number;
}

const QuantumPad: React.FC<QuantumPadProps> = ({
  className,
  onChange,
  xLabel = "X",
  yLabel = "Y",
  initialX = 0.5,
  initialY = 0.5,
}) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updatePosition = (e: React.PointerEvent) => {
    if (!padRef.current) return;

    const rect = padRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left) / rect.width;
    let y = (e.clientY - rect.top) / rect.height;

    // Clamp values between 0 and 1
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    // Invert Y so 0 is bottom and 1 is top
    y = 1 - y;

    setPos({ x, y });
    onChange(x, y);
  };

  // Register and clean up global events
  useEffect(() => {
    const handlePointerUpGlobal = () => {
      setIsDragging(false);
    };

    window.addEventListener("pointerup", handlePointerUpGlobal);
    return () => {
      window.removeEventListener("pointerup", handlePointerUpGlobal);
    };
  }, []);

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        ref={padRef}
        className="neumorph w-full h-40 relative cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 quantum-grid"></div>

        {/* X and Y labels */}
        <div className="absolute bottom-2 right-2 text-xs text-quantum-muted">{xLabel}</div>
        <div className="absolute top-2 left-2 text-xs text-quantum-muted">{yLabel}</div>

        {/* Cursor */}
        <div
          className="absolute w-4 h-4 rounded-full bg-quantum-accent shadow-quantum-glow transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${pos.x * 100}%`,
            bottom: `${pos.y * 100}%`,
          }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <div className="bg-quantum-light px-2 py-1 rounded-md font-mono">
          X: {pos.x.toFixed(2)}
        </div>
        <div className="bg-quantum-light px-2 py-1 rounded-md font-mono">
          Y: {pos.y.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default QuantumPad;
