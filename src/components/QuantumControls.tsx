
import React, { useState } from "react";
import QuantumKnob from "./QuantumKnob";
import QuantumSlider from "./QuantumSlider";
import QuantumSwitch from "./QuantumSwitch";
import WaveSelector from "./WaveSelector";
import SpectralMappingSelector from "./SpectralMappingSelector";
import { cn } from "@/lib/utils";

interface QuantumControlsProps {
  className?: string;
  onChange?: (settings: QuantumSettings) => void;
}

export type SpectralMode = "freq_qubits" | "amp_phase" | "harm_ent" | "qpixl_bi";

export interface QuantumSettings {
  qubits: number;
  shots: number;
  entanglement: number;
  superposition: number;
  gateType: string;
  waveform: "sine" | "square" | "triangle" | "sawtooth" | "quantumNoise";
  reverb: boolean;
  reverbMix: number;
  chorus: boolean;
  stereo: boolean;
  quantumFilter: number;
  // Advanced quantum features
  qpixlIntegration: boolean;
  spectralMapping: SpectralMode;
  temporalCoherence: number;
  quantumHarmony: boolean;
  compressionThreshold: number;
}

const QuantumControls: React.FC<QuantumControlsProps> = ({
  className,
  onChange,
}) => {
  const [settings, setSettings] = useState<QuantumSettings>({
    qubits: 4,
    shots: 1024,
    entanglement: 50,
    superposition: 75,
    gateType: "H",
    waveform: "sine",
    reverb: true,
    reverbMix: 30,
    chorus: false,
    stereo: true,
    quantumFilter: 60,
    // Initialize advanced features
    qpixlIntegration: false,
    spectralMapping: "freq_qubits",
    temporalCoherence: 50,
    quantumHarmony: false,
    compressionThreshold: 30,
  });

  const updateSettings = <K extends keyof QuantumSettings>(
    key: K,
    value: QuantumSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onChange?.(newSettings);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-2 gap-4">
        <QuantumSlider
          label="Qubits"
          value={settings.qubits}
          min={2}
          max={8}
          step={1}
          onChange={(value) => updateSettings("qubits", value)}
        />
        
        <QuantumSlider
          label="Shots"
          value={settings.shots}
          min={256}
          max={4096}
          step={256}
          onChange={(value) => updateSettings("shots", value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <QuantumKnob
          label="Entanglement"
          value={settings.entanglement}
          min={0}
          max={100}
          onChange={(value) => updateSettings("entanglement", value)}
        />
        
        <QuantumKnob
          label="Superposition"
          value={settings.superposition}
          min={0}
          max={100}
          onChange={(value) => updateSettings("superposition", value)}
        />
        
        <QuantumKnob
          label="Q-Filter"
          value={settings.quantumFilter}
          min={0}
          max={100}
          onChange={(value) => updateSettings("quantumFilter", value)}
        />
      </div>

      <WaveSelector
        value={settings.waveform}
        onChange={(value) => updateSettings("waveform", value)}
      />

      {/* Advanced Quantum Features Section */}
      <div className="pt-4 border-t border-quantum-light">
        <h3 className="text-sm font-medium mb-4">Advanced Quantum Controls</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <QuantumSwitch
            label="QPIXL Integration"
            value={settings.qpixlIntegration}
            onChange={(value) => updateSettings("qpixlIntegration", value)}
          />
          
          <QuantumSwitch
            label="Quantum Harmony"
            value={settings.quantumHarmony}
            onChange={(value) => updateSettings("quantumHarmony", value)}
          />
        </div>
        
        {settings.qpixlIntegration && (
          <>
            <div className="mt-4">
              <SpectralMappingSelector
                value={settings.spectralMapping}
                onChange={(value) => updateSettings("spectralMapping", value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <QuantumSlider
                label="Compression"
                value={settings.compressionThreshold}
                min={0}
                max={100}
                onChange={(value) => updateSettings("compressionThreshold", value)}
                unit="%"
              />
              
              <QuantumSlider
                label="Temporal Coherence"
                value={settings.temporalCoherence}
                min={0}
                max={100}
                onChange={(value) => updateSettings("temporalCoherence", value)}
                unit="%"
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Effects</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <QuantumSwitch
            label="Reverb"
            value={settings.reverb}
            onChange={(value) => updateSettings("reverb", value)}
          />
          
          <QuantumSwitch
            label="Chorus"
            value={settings.chorus}
            onChange={(value) => updateSettings("chorus", value)}
          />
          
          <QuantumSwitch
            label="Stereo"
            value={settings.stereo}
            onChange={(value) => updateSettings("stereo", value)}
          />
        </div>
        
        {settings.reverb && (
          <QuantumSlider
            label="Reverb Mix"
            value={settings.reverbMix}
            min={0}
            max={100}
            onChange={(value) => updateSettings("reverbMix", value)}
            unit="%"
          />
        )}
      </div>
    </div>
  );
};

export default QuantumControls;
