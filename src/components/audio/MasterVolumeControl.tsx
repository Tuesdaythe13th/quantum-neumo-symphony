
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Volume } from "lucide-react";

interface MasterVolumeControlProps {
  volume: number;
  onChange: (volume: number) => void;
}

const MasterVolumeControl: React.FC<MasterVolumeControlProps> = ({
  volume,
  onChange
}) => {
  return (
    <div className="neumorph p-3 rounded-lg"> {/* Step 4: Reduce padding */}
      <div className="flex items-center gap-2 mb-2"> {/* Step 4: Reduce mb */}
        <Volume className="w-4 h-4 text-quantum-accent" /> {/* Step 4: Smaller icon */}
        <h3 className="text-sm font-medium">Master Volume</h3> {/* Step 4: Smaller text */}
      </div>
      
      <div className="flex items-center gap-2 mb-1"> {/* Step 4: Reduce gap, mb */}
        <span className="text-xs">Volume:</span> {/* Step 4: Smaller text */}
        <Slider 
          className="flex-1"
          min={0} 
          max={1} 
          step={0.01}
          value={[volume]}
          onValueChange={([value]) => onChange(value)}
        />
        <span className="text-xs w-7 text-right">{Math.round(volume * 100)}%</span> {/* Step 4: Smaller text, width */}
      </div>
    </div>
  );
};

export default MasterVolumeControl;
