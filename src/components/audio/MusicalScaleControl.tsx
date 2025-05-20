
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
    <div className="neumorph p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-quantum-accent" />
        <h3 className="text-lg font-medium">Musical Scale Mapping</h3>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="enable-scale">Enable Musical Scale Quantization</Label>
        <Switch 
          id="enable-scale" 
          checked={settings.enableMusicalScale}
          onCheckedChange={(checked) => onChange('enableMusicalScale', checked)}
        />
      </div>
      
      {settings.enableMusicalScale && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scale-type">Musical Scale</Label>
            <Select 
              value={settings.scaleType}
              onValueChange={(value) => onChange('scaleType', value)}
            >
              <SelectTrigger id="scale-type">
                <SelectValue placeholder="Select scale" />
              </SelectTrigger>
              <SelectContent>
                {musicalScales.map(scale => (
                  <SelectItem key={scale.value} value={scale.value}>{scale.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
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
          
          <div className="space-y-2">
            <Label htmlFor="qpixl-note-select">QPIXL Index for Note Choice</Label>
            <Select 
              value={settings.qpixlNoteSelectionMethod}
              onValueChange={(value) => onChange('qpixlNoteSelectionMethod', value)}
            >
              <SelectTrigger id="qpixl-note-select">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="First QPIXL Value">First QPIXL Value</SelectItem>
                <SelectItem value="Average QPIXL Value">Average QPIXL Value</SelectItem>
                <SelectItem value="Random QPIXL Value">Random QPIXL Value per Note/Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(settings.scaleType === 'Microtonal QPIXL (Octave Segmented)' || 
            settings.scaleType === 'Microtonal QPIXL (Full Range)') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Microtonal Range (Octaves): {settings.microtonalOctaveRange}</Label>
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
