
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Music } from "lucide-react";

interface MusicalScaleSettings {
  enableMusicalScale: boolean;
  scaleType: string;
  rootNote: number;
  qpixlNoteSelectionMethod: string;
  microtonalOctaveRange: number;
}

interface MusicalScaleControlProps {
  settings: MusicalScaleSettings;
  onChange: <K extends keyof MusicalScaleSettings>(key: K, value: MusicalScaleSettings[K]) => void;
  musicalScales: { value: string, label: string }[];
}

const MusicalScaleControl: React.FC<MusicalScaleControlProps> = ({
  settings,
  onChange,
  musicalScales
}) => {
  return (
    <div className="neumorph p-3 rounded-lg"> {/* Step 4: Reduce padding */}
      <div className="flex items-center gap-2 mb-2"> {/* Step 4: Reduce mb */}
        <Music className="w-4 h-4 text-quantum-accent" /> {/* Step 4: Smaller icon */}
        <h3 className="text-sm font-medium">Musical Scale Mapping</h3> {/* Step 4: Smaller text */}
      </div>
      
      <div className="flex items-center justify-between mb-3"> {/* Step 4: Reduce mb */}
        <Label htmlFor="enable-scale" className="text-xs">Enable Musical Scale Quantization</Label> {/* Step 4: Smaller text */}
        <Switch 
          id="enable-scale" 
          checked={settings.enableMusicalScale}
          onCheckedChange={(checked) => onChange('enableMusicalScale', checked)}
          // Consider scale-75 or scale-90 if Switch component supports it or custom CSS for smaller switch
        />
      </div>
      
      {settings.enableMusicalScale && (
        <div className="space-y-3"> {/* Step 4: Reduce space-y */}
          <div className="space-y-1"> {/* Step 4: Reduce space-y */}
            <Label htmlFor="scale-type" className="text-xs">Musical Scale</Label> {/* Step 4: Smaller text */}
            <Select 
              value={settings.scaleType}
              onValueChange={(value) => onChange('scaleType', value)}
            >
              <SelectTrigger id="scale-type" className="text-xs h-8"> {/* Step 4: Smaller text, height */}
                <SelectValue placeholder="Select scale" />
              </SelectTrigger>
              <SelectContent>
                {musicalScales.map(scale => (
                  <SelectItem key={scale.value} value={scale.value} className="text-xs">{scale.label}</SelectItem> /* Step 4: Smaller text */
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1"> {/* Step 4: Reduce space-y */}
            <div className="flex items-center justify-between">
              <Label className="text-xs"> {/* Step 4: Smaller text */}
                Scale Root Note: {settings.rootNote} 
                {settings.rootNote === 48 && " (C3)"}
                {settings.rootNote === 60 && " (C4)"}
              </Label>
            </div>
            <Slider 
              min={36} 
              max={72} 
              step={1}
              value={[settings.rootNote]}
              onValueChange={([value]) => onChange('rootNote', value)}
            />
          </div>
          
          <div className="space-y-1"> {/* Step 4: Reduce space-y */}
            <Label htmlFor="qpixl-note-select" className="text-xs">QPIXL Index for Note Choice</Label> {/* Step 4: Smaller text */}
            <Select 
              value={settings.qpixlNoteSelectionMethod}
              onValueChange={(value) => onChange('qpixlNoteSelectionMethod', value)}
            >
              <SelectTrigger id="qpixl-note-select" className="text-xs h-8"> {/* Step 4: Smaller text, height */}
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="First QPIXL Value" className="text-xs">First QPIXL Value</SelectItem> {/* Step 4: Smaller text */}
                <SelectItem value="Average QPIXL Value" className="text-xs">Average QPIXL Value</SelectItem> {/* Step 4: Smaller text */}
                <SelectItem value="Random QPIXL Value" className="text-xs">Random QPIXL Value per Note/Event</SelectItem> {/* Step 4: Smaller text */}
              </SelectContent>
            </Select>
          </div>
          
          {(settings.scaleType === 'Microtonal QPIXL (Octave Segmented)' || 
            settings.scaleType === 'Microtonal QPIXL (Full Range)') && (
            <div className="space-y-1"> {/* Step 4: Reduce space-y */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">Microtonal Range (Octaves): {settings.microtonalOctaveRange}</Label> {/* Step 4: Smaller text */}
              </div>
              <Slider 
                min={1} 
                max={4} 
                step={1}
                value={[settings.microtonalOctaveRange]}
                onValueChange={([value]) => onChange('microtonalOctaveRange', value)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MusicalScaleControl;
