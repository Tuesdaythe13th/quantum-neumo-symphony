
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Step 3: Import Accordion
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
    // Step 3: Implement Accordion. Remove outer space-y-4, apply to Accordion if needed or let items handle spacing.
    <Accordion type="single" collapsible defaultValue="master-volume" className="w-full">
      <AccordionItem value="master-volume">
        <AccordionTrigger className="text-sm font-medium p-3 hover:no-underline">Master Volume</AccordionTrigger> {/* Compactness: p-3 */}
        <AccordionContent className="p-1 pt-0"> {/* Compactness: p-1 pt-0 */}
          <MasterVolumeControl 
            volume={settings.masterVolume}
            onChange={(value) => handleSettingChange('masterVolume', value)}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="additive-synthesis">
        <AccordionTrigger className="text-sm font-medium p-3 hover:no-underline">Additive Synthesis</AccordionTrigger> {/* Compactness: p-3 */}
        <AccordionContent className="p-1 pt-0"> {/* Compactness: p-1 pt-0 */}
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
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="musical-scale">
        <AccordionTrigger className="text-sm font-medium p-3 hover:no-underline">Musical Scale Mapping</AccordionTrigger> {/* Compactness: p-3 */}
        <AccordionContent className="p-1 pt-0"> {/* Compactness: p-1 pt-0 */}
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default QuantumAdvancedAudio;
