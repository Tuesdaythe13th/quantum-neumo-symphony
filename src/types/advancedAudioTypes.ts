
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
export const defaultSettings: AdvancedAudioSettings = {
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
