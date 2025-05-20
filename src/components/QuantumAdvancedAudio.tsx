
import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormControl, FormLabel, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Volume, Music, Waveform, Gauge } from "lucide-react";

// Define the types for our advanced audio settings
export interface AdvancedAudioSettings {
  // Additive Synthesis
  enableAdditive: boolean;
  numPartials: number;
  harmonicControlMapping: 'Amplitudes' | 'Frequencies' | 'Phases';
  harmonicSpreadFactor: number;
  harmonicAmplitudeProfile: '1/h' | 'Flat' | '1/h^2' | 'QPIXL-Shaped';
  
  // Musical Scale
  enableMusicalScale: boolean;
  scaleType: string;
  rootNote: number;
  qpixlNoteSelectionMethod: string;
  microtonalOctaveRange: number;
  
  // Main Volume
  masterVolume: number;
}

// Default settings
const defaultSettings: AdvancedAudioSettings = {
  enableAdditive: false,
  numPartials: 4,
  harmonicControlMapping: 'Amplitudes',
  harmonicSpreadFactor: 0.02,
  harmonicAmplitudeProfile: '1/h',
  
  enableMusicalScale: false,
  scaleType: 'Chromatic',
  rootNote: 48, // C3
  qpixlNoteSelectionMethod: 'First QPIXL Value',
  microtonalOctaveRange: 2,
  
  masterVolume: 0.7,
};

interface QuantumAdvancedAudioProps {
  onChange: (settings: AdvancedAudioSettings) => void;
  initialSettings?: Partial<AdvancedAudioSettings>;
}

const QuantumAdvancedAudio: React.FC<QuantumAdvancedAudioProps> = ({
  onChange,
  initialSettings = {}
}) => {
  const [settings, setSettings] = useState<AdvancedAudioSettings>({
    ...defaultSettings,
    ...initialSettings
  });
  
  // Handle changes to any setting
  const handleSettingChange = <K extends keyof AdvancedAudioSettings>(
    key: K, 
    value: AdvancedAudioSettings[K]
  ) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    onChange(newSettings);
  };

  // Musical scales available
  const musicalScales = [
    { value: 'Chromatic', label: 'Chromatic' },
    { value: 'Major Pentatonic', label: 'Major Pentatonic' },
    { value: 'Minor Pentatonic', label: 'Minor Pentatonic' },
    { value: 'Blues', label: 'Blues' },
    { value: 'Whole Tone', label: 'Whole Tone' },
    { value: 'Microtonal QPIXL (Octave Segmented)', label: 'Microtonal QPIXL (Octave Segmented)' },
    { value: 'Microtonal QPIXL (Full Range)', label: 'Microtonal QPIXL (Full Range)' }
  ];

  return (
    <div className="space-y-6">
      {/* Master Volume Control */}
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
            value={[settings.masterVolume]}
            onValueChange={([value]) => handleSettingChange('masterVolume', value)}
          />
          <span className="text-sm w-8 text-right">{Math.round(settings.masterVolume * 100)}%</span>
        </div>
      </div>

      {/* Additive Synthesis Control Panel */}
      <div className="neumorph p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Waveform className="w-5 h-5 text-quantum-accent" />
          <h3 className="text-lg font-medium">Additive Synthesis</h3>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Label htmlFor="enable-additive">Enable Additive Synthesis</Label>
          <Switch 
            id="enable-additive" 
            checked={settings.enableAdditive}
            onCheckedChange={(checked) => handleSettingChange('enableAdditive', checked)}
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
                onValueChange={([value]) => handleSettingChange('numPartials', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="harmonic-mapping">Harmonic Parameter Driven by QPIXL</Label>
              <Select 
                value={settings.harmonicControlMapping}
                onValueChange={(value) => handleSettingChange('harmonicControlMapping', value as any)}
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
                  onValueChange={([value]) => handleSettingChange('harmonicSpreadFactor', value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="amplitude-profile">Harmonic Amplitude Profile</Label>
              <Select 
                value={settings.harmonicAmplitudeProfile}
                onValueChange={(value) => handleSettingChange('harmonicAmplitudeProfile', value as any)}
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
      
      {/* Musical Scale Mapping */}
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
            onCheckedChange={(checked) => handleSettingChange('enableMusicalScale', checked)}
          />
        </div>
        
        {settings.enableMusicalScale && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scale-type">Musical Scale</Label>
              <Select 
                value={settings.scaleType}
                onValueChange={(value) => handleSettingChange('scaleType', value)}
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
                onValueChange={([value]) => handleSettingChange('rootNote', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qpixl-note-select">QPIXL Index for Note Choice</Label>
              <Select 
                value={settings.qpixlNoteSelectionMethod}
                onValueChange={(value) => handleSettingChange('qpixlNoteSelectionMethod', value)}
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
                  onValueChange={([value]) => handleSettingChange('microtonalOctaveRange', value)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuantumAdvancedAudio;
