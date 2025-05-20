
import React, { useState } from 'react';
import { AdvancedAudioSettings, defaultSettings } from '@/types/advancedAudioTypes';
import MasterVolumeControl from '@/components/audio/MasterVolumeControl';
import AdditiveSynthesisControl from '@/components/audio/AdditiveSynthesisControl';
import MusicalScaleControl from '@/components/audio/MusicalScaleControl';

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
      <MasterVolumeControl 
        volume={settings.masterVolume}
        onChange={(value) => handleSettingChange('masterVolume', value)}
      />

      {/* Additive Synthesis Control */}
      <AdditiveSynthesisControl 
        settings={{
          enableAdditive: settings.enableAdditive,
          numPartials: settings.numPartials,
          harmonicControlMapping: settings.harmonicControlMapping,
          harmonicSpreadFactor: settings.harmonicSpreadFactor,
          harmonicAmplitudeProfile: settings.harmonicAmplitudeProfile
        }}
        onChange={handleSettingChange}
      />
      
      {/* Musical Scale Mapping */}
      <MusicalScaleControl 
        settings={{
          enableMusicalScale: settings.enableMusicalScale,
          scaleType: settings.scaleType,
          rootNote: settings.rootNote,
          qpixlNoteSelectionMethod: settings.qpixlNoteSelectionMethod,
          microtonalOctaveRange: settings.microtonalOctaveRange
        }}
        onChange={handleSettingChange}
        musicalScales={musicalScales}
      />
    </div>
  );
};

export default QuantumAdvancedAudio;
