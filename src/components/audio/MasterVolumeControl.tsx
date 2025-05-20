
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
    <div className="neumorph p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Volume className="w-5 h-5 text-quantum-accent" />
        <h3 className="text-lg font-medium">Master Volume</h3>
      </div>
      
      <div className="flex items-center gap-4 mb-2">
        <span className="text-sm">Volume:</span>
        <Slider 
          className="flex-1"
          min={0} 
          max={1} 
          step={0.01}
          value={[volume]}
          onValueChange={([value]) => onChange(value)}
        />
        <span className="text-sm w-8 text-right">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
};

export default MasterVolumeControl;
