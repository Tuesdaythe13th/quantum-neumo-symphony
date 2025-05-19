
import React, { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Atom, Radio, Sliders, WaveformIcon, Play, Volume2 } from "lucide-react";

import QuantumControls, { QuantumSettings } from "@/components/QuantumControls";
import VisualAnalyzer from "@/components/VisualAnalyzer";
import QuantumPad from "@/components/QuantumPad";
import DAWTransport from "@/components/DAWTransport";
import { toast } from "sonner";

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [quantumSettings, setQuantumSettings] = useState<QuantumSettings | null>(null);

  // Initialize audio context on user interaction
  const initAudio = () => {
    if (audioContext) return;
    
    try {
      const newAudioContext = new AudioContext();
      const newAnalyserNode = newAudioContext.createAnalyser();
      newAnalyserNode.fftSize = 2048;
      newAnalyserNode.connect(newAudioContext.destination);
      
      setAudioContext(newAudioContext);
      setAnalyserNode(newAnalyserNode);
      
      toast.success("Audio engine initialized");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      toast.error("Failed to initialize audio");
    }
  };

  const handlePlay = () => {
    initAudio();
    setIsPlaying(true);
    toast.success("Quantum synthesis started");
  };

  const handleStop = () => {
    setIsPlaying(false);
    toast.info("Synthesis stopped");
  };

  const handleSave = () => {
    toast.success("Preset saved");
  };

  const handleExport = () => {
    toast.success("Audio exported successfully");
  };

  const handleSettings = () => {
    toast.info("Settings panel opened");
  };

  const handleQuantumPadChange = (x: number, y: number) => {
    // In a real implementation, this would update synthesis parameters
    console.log("Quantum pad values:", { x, y });
  };

  useEffect(() => {
    // Clean up audio context when component unmounts
    return () => {
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, [audioContext]);

  return (
    <div className="min-h-screen bg-quantum-bg text-white p-4 md:p-6 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold gradient-text flex items-center justify-center gap-3">
          <Atom className="h-8 w-8 text-quantum-accent animate-pulse-glow" />
          Quantum Music Synthesizer
        </h1>
        <p className="text-center text-quantum-muted max-w-2xl mx-auto mt-2">
          A neumorphic DAW interface powered by quantum computing principles
        </p>
      </header>

      {/* Main DAW Interface */}
      <div className="neumorph p-6 rounded-xl">
        {/* Transport Controls */}
        <DAWTransport
          onPlay={handlePlay}
          onStop={handleStop}
          onSave={handleSave}
          onExport={handleExport}
          onSettings={handleSettings}
          isPlaying={isPlaying}
          className="mb-6"
        />

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Quantum Controls Panel */}
          <div className="neumorph p-4 rounded-xl">
            <div className="flex items-center mb-4">
              <Atom className="h-5 w-5 text-quantum-accent mr-2" />
              <h2 className="text-xl font-bold">Quantum Parameters</h2>
            </div>
            
            <QuantumControls 
              onChange={setQuantumSettings}
            />
          </div>

          {/* Visualizer + Matrix */}
          <div className="neumorph p-4 rounded-xl lg:col-span-2">
            <div className="flex items-center mb-4">
              <WaveformIcon className="h-5 w-5 text-quantum-accent mr-2" />
              <h2 className="text-xl font-bold">Quantum Visualizer</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Visualizer */}
              <div className="md:col-span-2">
                <div className="neumorph h-60 rounded-xl overflow-hidden">
                  <VisualAnalyzer 
                    type="quantum" 
                    color="#9b87f5"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <button 
                    className="neumorph-button flex items-center justify-center gap-2 text-sm"
                    onClick={() => toast.info("Waveform view selected")}
                  >
                    <Waveform className="h-4 w-4" />
                    Waveform
                  </button>
                  <button 
                    className="neumorph-button flex items-center justify-center gap-2 text-sm"
                    onClick={() => toast.info("Frequency view selected")}
                  >
                    <Volume2 className="h-4 w-4" />
                    Spectrum
                  </button>
                  <button 
                    className="neumorph-active flex items-center justify-center gap-2 text-sm"
                  >
                    <Atom className="h-4 w-4" />
                    Quantum
                  </button>
                </div>
              </div>
              
              {/* XY Pad */}
              <div className="h-full">
                <div className="flex flex-col h-full">
                  <label className="text-sm font-medium mb-2">Quantum Matrix</label>
                  <QuantumPad
                    xLabel="Decoherence"
                    yLabel="Amplitude"
                    onChange={handleQuantumPadChange}
                    className="flex-grow"
                  />
                </div>
              </div>
            </div>
            
            {/* Audio Output */}
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <Radio className="h-5 w-5 text-quantum-accent mr-2" />
                <h3 className="text-lg font-medium">Quantum Audio Output</h3>
              </div>
              
              <div className="neumorph h-24 rounded-xl overflow-hidden">
                <VisualAnalyzer 
                  type="waveform"
                  color="#9b87f5"
                />
              </div>
              
              {/* Audio Controls */}
              <div className="flex items-center justify-between mt-4">
                <button
                  className={`${isPlaying ? "neumorph-active" : "neumorph"} p-3 rounded-full`}
                  onClick={isPlaying ? handleStop : handlePlay}
                >
                  <Play className="h-5 w-5" />
                </button>
                
                <div className="flex-1 mx-4">
                  <div className="bg-quantum-light h-1 rounded-full overflow-hidden">
                    <div className="bg-quantum-accent h-full" style={{ width: "30%" }}></div>
                  </div>
                </div>
                
                <div className="font-mono text-sm">00:00 / 02:30</div>
              </div>
            </div>
          </div>
        </div>

        {/* Effects and Processors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="neumorph p-4 rounded-xl">
            <div className="flex items-center mb-4">
              <Sliders className="h-5 w-5 text-quantum-accent mr-2" />
              <h2 className="text-xl font-bold">Quantum Circuit</h2>
            </div>
            
            <div className="h-40 quantum-grid flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="text-quantum-accent text-lg font-medium mb-2">Circuit Design</div>
                <p className="text-quantum-muted text-sm">
                  {quantumSettings 
                    ? `Circuit with ${quantumSettings.qubits} qubits and ${quantumSettings.shots} shots`
                    : "No quantum circuit configured yet"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="neumorph p-4 rounded-xl">
            <div className="flex items-center mb-4">
              <Radio className="h-5 w-5 text-quantum-accent mr-2" />
              <h2 className="text-xl font-bold">Measurement Analysis</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {["00", "01", "10", "11"].map((state) => (
                <div 
                  key={state} 
                  className="neumorph p-3 rounded-lg flex flex-col items-center"
                >
                  <div className="text-sm mb-1 font-mono">{state}</div>
                  <div className="text-xl font-medium text-quantum-accent">
                    {Math.floor(Math.random() * 40 + 10)}%
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-center text-quantum-muted">
              Showing quantum state probabilities based on measurement
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-quantum-muted text-sm">
        <p>Quantum Music Synthesizer - Made with ❤️ and quantum superposition</p>
      </footer>
    </div>
  );
};

export default Index;
