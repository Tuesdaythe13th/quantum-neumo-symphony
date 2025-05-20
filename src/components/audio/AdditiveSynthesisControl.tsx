
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
    <div className="neumorph p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <AudioWaveform className="w-5 h-5 text-quantum-accent" />
        <h3 className="text-lg font-medium">Additive Synthesis</h3>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="enable-additive">Enable Additive Synthesis</Label>
        <Switch 
          id="enable-additive" 
          checked={settings.enableAdditive}
          onCheckedChange={(checked) => onChange('enableAdditive', checked)}
        />
      </div>
      
      {settings.enableAdditive && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Harmonic Richness (Partials): {settings.numPartials}</Label>
            </div>
            <Slider 
              min={1} 
              max={16} 
              step={1}
              value={[settings.numPartials]}
              onValueChange={([value]) => onChange('numPartials', value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="harmonic-mapping">Harmonic Parameter Driven by QPIXL</Label>
            <Select 
              value={settings.harmonicControlMapping}
              onValueChange={(value) => onChange('harmonicControlMapping', value as any)}
            >
              <SelectTrigger id="harmonic-mapping">
                <SelectValue placeholder="Select mapping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Amplitudes">Amplitudes</SelectItem>
                <SelectItem value="Frequencies">Frequencies (Micro-detuning)</SelectItem>
                <SelectItem value="Phases">Phases</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {settings.harmonicControlMapping === 'Frequencies' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Harmonic Spread: {settings.harmonicSpreadFactor.toFixed(3)}</Label>
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
          
          <div className="space-y-2">
            <Label htmlFor="amplitude-profile">Harmonic Amplitude Profile</Label>
            <Select 
              value={settings.harmonicAmplitudeProfile}
              onValueChange={(value) => onChange('harmonicAmplitudeProfile', value as any)}
            >
              <SelectTrigger id="amplitude-profile">
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1/h">1/h (Natural)</SelectItem>
                <SelectItem value="Flat">Flat</SelectItem>
                <SelectItem value="1/h^2">1/h² (Steep)</SelectItem>
                <SelectItem value="QPIXL-Shaped">QPIXL-Shaped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditiveSynthesisControl;
