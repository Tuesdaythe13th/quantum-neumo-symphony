
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AudioWaveform } from "lucide-react";

interface AdditiveSynthesisSettings {
  enableAdditive: boolean;
  numPartials: number;
  harmonicControlMapping: 'Amplitudes' | 'Frequencies' | 'Phases';
  harmonicSpreadFactor: number;
  harmonicAmplitudeProfile: '1/h' | 'Flat' | '1/h^2' | 'QPIXL-Shaped';
}

interface AdditiveSynthesisControlProps {
  settings: AdditiveSynthesisSettings;
  onChange: <K extends keyof AdditiveSynthesisSettings>(key: K, value: AdditiveSynthesisSettings[K]) => void;
}

const AdditiveSynthesisControl: React.FC<AdditiveSynthesisControlProps> = ({
  settings,
  onChange
}) => {
  return (
    <div className="neumorph p-3 rounded-lg"> {/* Step 4: Reduce padding */}
      <div className="flex items-center gap-2 mb-2"> {/* Step 4: Reduce mb */}
        <AudioWaveform className="w-4 h-4 text-quantum-accent" /> {/* Step 4: Smaller icon */}
        <h3 className="text-sm font-medium">Additive Synthesis</h3> {/* Step 4: Smaller text */}
      </div>
      
      <div className="flex items-center justify-between mb-3"> {/* Step 4: Reduce mb */}
        <Label htmlFor="enable-additive" className="text-xs">Enable Additive Synthesis</Label> {/* Step 4: Smaller text */}
        <Switch 
          id="enable-additive" 
          checked={settings.enableAdditive}
          onCheckedChange={(checked) => onChange('enableAdditive', checked)}
          // Consider scale-75 or scale-90 if Switch component supports it or custom CSS for smaller switch
        />
      </div>
      
      {settings.enableAdditive && (
        <div className="space-y-3"> {/* Step 4: Reduce space-y */}
          <div className="space-y-1"> {/* Step 4: Reduce space-y */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Harmonic Richness (Partials): {settings.numPartials}</Label> {/* Step 4: Smaller text */}
            </div>
            <Slider 
              min={1} 
              max={16} 
              step={1}
              value={[settings.numPartials]}
              onValueChange={([value]) => onChange('numPartials', value)}
            />
          </div>
          
          <div className="space-y-1"> {/* Step 4: Reduce space-y */}
            <Label htmlFor="harmonic-mapping" className="text-xs">Harmonic Parameter Driven by QPIXL</Label> {/* Step 4: Smaller text */}
            <Select 
              value={settings.harmonicControlMapping}
              onValueChange={(value) => onChange('harmonicControlMapping', value as any)}
            >
              <SelectTrigger id="harmonic-mapping" className="text-xs h-8"> {/* Step 4: Smaller text, height */}
                <SelectValue placeholder="Select mapping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Amplitudes" className="text-xs">Amplitudes</SelectItem> {/* Step 4: Smaller text */}
                <SelectItem value="Frequencies" className="text-xs">Frequencies (Micro-detuning)</SelectItem> {/* Step 4: Smaller text */}
                <SelectItem value="Phases" className="text-xs">Phases</SelectItem> {/* Step 4: Smaller text */}
              </SelectContent>
            </Select>
          </div>
          
          {settings.harmonicControlMapping === 'Frequencies' && (
            <div className="space-y-1"> {/* Step 4: Reduce space-y */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">Harmonic Spread: {settings.harmonicSpreadFactor.toFixed(3)}</Label> {/* Step 4: Smaller text */}
              </div>
              <Slider 
                min={0} 
                max={0.1} 
                step={0.001}
                value={[settings.harmonicSpreadFactor]}
                onValueChange={([value]) => onChange('harmonicSpreadFactor', value)}
              />
            </div>
          )}
          
          <div className="space-y-1"> {/* Step 4: Reduce space-y */}
            <Label htmlFor="amplitude-profile" className="text-xs">Harmonic Amplitude Profile</Label> {/* Step 4: Smaller text */}
            <Select 
              value={settings.harmonicAmplitudeProfile}
              onValueChange={(value) => onChange('harmonicAmplitudeProfile', value as any)}
            >
              <SelectTrigger id="amplitude-profile" className="text-xs h-8"> {/* Step 4: Smaller text, height */}
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1/h" className="text-xs">1/h (Natural)</SelectItem> {/* Step 4: Smaller text */}
                <SelectItem value="Flat" className="text-xs">Flat</SelectItem> {/* Step 4: Smaller text */}
                <SelectItem value="1/h^2" className="text-xs">1/h² (Steep)</SelectItem> {/* Step 4: Smaller text */}
                <SelectItem value="QPIXL-Shaped" className="text-xs">QPIXL-Shaped</SelectItem> {/* Step 4: Smaller text */}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditiveSynthesisControl;
