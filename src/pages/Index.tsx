
import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { 
  Atom, Radio, Sliders, AudioWaveform, Play, 
  Volume2, Upload, Grid, Download, Waveform 
} from "lucide-react";

import QuantumControls, { QuantumSettings, SpectralMode } from "@/components/QuantumControls";
import VisualAnalyzer from "@/components/VisualAnalyzer";
import QuantumPad from "@/components/QuantumPad";
import DAWTransport from "@/components/DAWTransport";
import { toast } from "sonner";
import { quantumAudioEngine, QuantumAudioState } from "@/lib/quantumAudioEngine";

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [quantumSettings, setQuantumSettings] = useState<QuantumSettings | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("00:00");
  const [totalTime, setTotalTime] = useState<string>("00:00");
  const [audioState, setAudioState] = useState<QuantumAudioState | null>(null);
  const [visualizerType, setVisualizerType] = useState<"waveform" | "frequency" | "quantum" | "qpixl">("quantum");
  const [temporalCoherence, setTemporalCoherence] = useState<number>(50);
  
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize audio context on user interaction
  const initAudio = () => {
    if (audioContext) return;
    
    try {
      const engine = quantumAudioEngine;
      const context = engine.getAudioContext();
      const analyser = engine.getAnalyser();
      
      if (context && analyser) {
        setAudioContext(context);
        setAnalyserNode(analyser);
        toast.success("Audio engine initialized");
      } else {
        throw new Error("Failed to get audio context");
      }
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      toast.error("Failed to initialize audio");
    }
  };

  const generateQuantumAudio = async () => {
    if (!quantumSettings) {
      toast.error("No quantum settings configured");
      return;
    }
    
    try {
      initAudio();
      const result = await quantumAudioEngine.generateQuantumSound(quantumSettings);
      setAudioState(result);
      
      if (quantumSettings.qpixlIntegration) {
        setVisualizerType("qpixl");
        setTemporalCoherence(quantumSettings.temporalCoherence);
      }
      
      // Format duration for display
      const minutes = Math.floor(result.duration / 60);
      const seconds = Math.floor(result.duration % 60);
      setTotalTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      toast.success("Quantum synthesis completed");
      return result;
    } catch (error) {
      console.error("Failed to generate quantum audio:", error);
      toast.error("Failed to generate quantum audio");
      return null;
    }
  };

  const handlePlay = async () => {
    initAudio();
    
    let stateToPlay = audioState;
    if (!stateToPlay || !stateToPlay.audioBuffer) {
      const result = await generateQuantumAudio();
      if (!result || !result.audioBuffer) return;
      stateToPlay = result;
    }
    
    // Play the generated audio
    quantumAudioEngine.play(stateToPlay.audioBuffer);
    setIsPlaying(true);
    
    // Start timer for tracking playback position
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    const startTime = audioContext?.currentTime || 0;
    
    timerRef.current = window.setInterval(() => {
      if (!audioContext) return;
      
      const elapsed = audioContext.currentTime - startTime;
      if (elapsed >= stateToPlay!.duration) {
        handleStop();
        return;
      }
      
      const minutes = Math.floor(elapsed / 60);
      const seconds = Math.floor(elapsed % 60);
      setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 100);
    
    toast.success("Quantum synthesis started");
  };

  const handleStop = () => {
    quantumAudioEngine.stop();
    setIsPlaying(false);
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setCurrentTime("00:00");
    toast.info("Synthesis stopped");
  };

  const handleSave = () => {
    toast.success("Preset saved");
  };

  const handleExport = () => {
    if (!audioState || !audioState.audioBuffer) {
      toast.error("No audio to export");
      return;
    }
    
    try {
      // Convert AudioBuffer to WAV file
      const offlineCtx = new OfflineAudioContext(
        audioState.audioBuffer.numberOfChannels,
        audioState.audioBuffer.length,
        audioState.audioBuffer.sampleRate
      );
      
      const source = offlineCtx.createBufferSource();
      source.buffer = audioState.audioBuffer;
      source.connect(offlineCtx.destination);
      source.start();
      
      offlineCtx.startRendering().then((renderedBuffer) => {
        // Create WAV file
        const wavBlob = audioBufferToWave(renderedBuffer);
        const url = URL.createObjectURL(wavBlob);
        
        // Create download link
        const a = document.createElement("a");
        a.href = url;
        a.download = "quantum-synthesis.wav";
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        toast.success("Audio exported successfully");
      });
    } catch (error) {
      console.error("Failed to export audio:", error);
      toast.error("Failed to export audio");
    }
  };

  const audioBufferToWave = (buffer: AudioBuffer): Blob => {
    // Simple WAV file encoder - could be replaced with a more robust solution
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // File length
    view.setUint32(4, 36 + length, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // Format chunk identifier
    writeString(view, 12, 'fmt ');
    // Format chunk length
    view.setUint32(16, 16, true);
    // Sample format (raw)
    view.setUint16(20, 1, true);
    // Channel count
    view.setUint16(22, numOfChannels, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 4, true);
    // Block align (channel count * bytes per sample)
    view.setUint16(32, numOfChannels * 2, true);
    // Bits per sample
    view.setUint16(34, 16, true);
    // Data chunk identifier
    writeString(view, 36, 'data');
    // Data chunk length
    view.setUint32(40, length, true);
    
    // Write the audio data
    const channels = [];
    let offset = 44;
    
    for (let i = 0; i < numOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numOfChannels; c++) {
        const sample = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const handleSettings = () => {
    toast.info("Settings panel opened");
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) return;
        
        if (file.type === 'audio/midi' || file.type === 'audio/mid' || file.name.endsWith('.mid') || file.name.endsWith('.midi')) {
          // Handle MIDI file
          toast.info("MIDI file support coming soon!");
        } else if (file.type === 'audio/wav' || file.type === 'audio/x-wav' || file.type === 'audio/mp3') {
          // Handle audio file
          if (!audioContext) {
            initAudio();
          }
          
          if (audioContext) {
            const arrayBuffer = e.target.result as ArrayBuffer;
            audioContext.decodeAudioData(arrayBuffer).then(buffer => {
              if (!buffer) return;
              
              setAudioState({
                audioBuffer: buffer,
                isPlaying: false,
                currentTime: 0,
                duration: buffer.duration,
                quantumProbabilities: {},
                circuitData: null
              });
              
              const minutes = Math.floor(buffer.duration / 60);
              const seconds = Math.floor(buffer.duration % 60);
              setTotalTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
              
              toast.success("Audio file loaded successfully");
            }).catch(err => {
              console.error("Failed to decode audio data:", err);
              toast.error("Failed to decode audio file");
            });
          }
        } else {
          toast.error("Unsupported file format");
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Failed to read file:", error);
      toast.error("Failed to read file");
    }
  };

  const handleQuantumPadChange = (x: number, y: number) => {
    // Update synthesis parameters in real-time
    console.log("Quantum pad values:", { x, y });
    
    if (quantumSettings && audioContext) {
      // Map x to entanglement and y to superposition
      const newSettings = {
        ...quantumSettings,
        entanglement: Math.round(x * 100),
        superposition: Math.round(y * 100)
      };
      
      setQuantumSettings(newSettings);
    }
  };

  useEffect(() => {
    // Clean up audio context and timers when component unmounts
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
      
      quantumAudioEngine.stop();
    };
  }, [audioContext]);

  return (
    <div className="min-h-screen bg-quantum-bg text-white p-4 md:p-6 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Hidden file input for uploads */}
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".mid,.midi,.wav,.mp3"
        onChange={handleFileChange}
      />
      
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
        <div className="flex justify-between items-center mb-6">
          <DAWTransport
            onPlay={handlePlay}
            onStop={handleStop}
            onSave={handleSave}
            onExport={handleExport}
            onSettings={handleSettings}
            isPlaying={isPlaying}
            className="flex-grow"
          />
          
          <button
            onClick={handleUpload}
            className="neumorph-button p-3 rounded-full ml-2"
            title="Upload MIDI or Audio File"
          >
            <Upload className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleExport}
            className="neumorph-button p-3 rounded-full ml-2"
            title="Export Audio"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>

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
              <AudioWaveform className="h-5 w-5 text-quantum-accent mr-2" />
              <h2 className="text-xl font-bold">Quantum Visualizer</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Visualizer */}
              <div className="md:col-span-2">
                <div className="neumorph h-60 rounded-xl overflow-hidden">
                  <VisualAnalyzer 
                    type={visualizerType}
                    color="#9b87f5"
                    audioContext={audioContext}
                    analyserNode={analyserNode}
                    qpixlData={audioState?.qpixlData}
                    temporalCoherence={temporalCoherence}
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <button 
                    className={`${visualizerType === 'waveform' ? 'neumorph-active' : 'neumorph-button'} flex items-center justify-center gap-2 text-sm p-2`}
                    onClick={() => setVisualizerType('waveform')}
                  >
                    <Waveform className="h-4 w-4" />
                    <span className="hidden sm:inline">Waveform</span>
                  </button>
                  
                  <button 
                    className={`${visualizerType === 'frequency' ? 'neumorph-active' : 'neumorph-button'} flex items-center justify-center gap-2 text-sm p-2`}
                    onClick={() => setVisualizerType('frequency')}
                  >
                    <Volume2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Spectrum</span>
                  </button>
                  
                  <button 
                    className={`${visualizerType === 'quantum' ? 'neumorph-active' : 'neumorph-button'} flex items-center justify-center gap-2 text-sm p-2`}
                    onClick={() => setVisualizerType('quantum')}
                  >
                    <Atom className="h-4 w-4" />
                    <span className="hidden sm:inline">Quantum</span>
                  </button>
                  
                  <button 
                    className={`${visualizerType === 'qpixl' ? 'neumorph-active' : 'neumorph-button'} flex items-center justify-center gap-2 text-sm p-2`}
                    onClick={() => setVisualizerType('qpixl')}
                  >
                    <Grid className="h-4 w-4" />
                    <span className="hidden sm:inline">QPIXL</span>
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
                  audioContext={audioContext}
                  analyserNode={analyserNode}
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
                    <div 
                      className="bg-quantum-accent h-full" 
                      style={{ 
                        width: audioState && audioState.duration > 0 
                          ? `${(parseFloat(currentTime.split(':')[0]) * 60 + parseFloat(currentTime.split(':')[1])) / audioState.duration * 100}%` 
                          : "0%" 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="font-mono text-sm">{currentTime} / {totalTime}</div>
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
              {audioState?.circuitData ? (
                <div className="grid grid-cols-1 gap-4 w-full">
                  <div className="text-center">
                    <div className="text-quantum-accent text-lg font-medium mb-2">
                      Circuit with {audioState.circuitData.qubits} qubits
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(audioState.circuitData.gates || {})
                        .slice(0, 6)
                        .map(([idx, gate]: [string, any], i) => (
                          <div key={i} className="neumorph px-2 py-1 rounded text-xs">
                            {gate.type} @ q{gate.qubit || gate.target || 0}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-quantum-accent text-lg font-medium mb-2">Circuit Design</div>
                  <p className="text-quantum-muted text-sm">
                    {quantumSettings 
                      ? `Circuit with ${quantumSettings.qubits} qubits and ${quantumSettings.shots} shots`
                      : "No quantum circuit configured yet"}
                  </p>
                </div>
              )}
            </div>
            
            {/* Compression Metrics Display */}
            {audioState?.compressionMetrics && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Quantum Compression</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="neumorph p-2 rounded-lg text-center">
                    <div className="text-xs text-quantum-muted">Original</div>
                    <div className="text-sm font-medium">
                      {audioState.compressionMetrics.originalComplexity.toFixed(2)}
                    </div>
                  </div>
                  <div className="neumorph p-2 rounded-lg text-center">
                    <div className="text-xs text-quantum-muted">Compressed</div>
                    <div className="text-sm font-medium">
                      {audioState.compressionMetrics.compressedComplexity.toFixed(2)}
                    </div>
                  </div>
                  <div className="neumorph p-2 rounded-lg text-center">
                    <div className="text-xs text-quantum-muted">Ratio</div>
                    <div className="text-sm font-medium">
                      {(audioState.compressionMetrics.compressionRatio * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="neumorph p-4 rounded-xl">
            <div className="flex items-center mb-4">
              <Radio className="h-5 w-5 text-quantum-accent mr-2" />
              <h2 className="text-xl font-bold">Measurement Analysis</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {audioState && audioState.quantumProbabilities ? 
                Object.entries(audioState.quantumProbabilities)
                  .slice(0, 4) // Show only first 4 states if there are many
                  .map(([state, prob]) => (
                    <div 
                      key={state} 
                      className="neumorph p-3 rounded-lg flex flex-col items-center"
                    >
                      <div className="text-sm mb-1 font-mono">{state}</div>
                      <div className="text-xl font-medium text-quantum-accent">
                        {Math.floor(prob * 100)}%
                      </div>
                    </div>
                  ))
                :
                ["00", "01", "10", "11"].map((state) => (
                  <div 
                    key={state} 
                    className="neumorph p-3 rounded-lg flex flex-col items-center"
                  >
                    <div className="text-sm mb-1 font-mono">{state}</div>
                    <div className="text-xl font-medium text-quantum-accent">
                      {Math.floor(Math.random() * 40 + 10)}%
                    </div>
                  </div>
                ))
              }
            </div>
            
            {/* Spectral Analysis */}
            {audioState?.spectralAnalysis && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Spectral Analysis</h3>
                <div className="neumorph p-3 rounded-lg">
                  <div className="h-12 relative">
                    {audioState.spectralAnalysis.amplitudes.length > 0 && (
                      <div className="absolute inset-0 flex items-end">
                        {Array.from({ length: 32 }).map((_, i) => {
                          const idx = Math.floor(i * audioState.spectralAnalysis!.amplitudes.length / 32);
                          const amp = audioState.spectralAnalysis!.amplitudes[idx] || 0;
                          return (
                            <div 
                              key={i} 
                              className="flex-1 mx-px bg-quantum-accent"
                              style={{ height: `${amp * 100}%` }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-center mt-2 text-quantum-muted">
                    {audioState.spectralAnalysis.harmonicRatios.length > 0 && (
                      <span>Harmony ratio: {audioState.spectralAnalysis.harmonicRatios[0].toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
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
