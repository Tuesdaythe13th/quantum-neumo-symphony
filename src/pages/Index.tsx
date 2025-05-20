import React, { useState, useEffect, useRef, useCallback } from "react";
import { Toaster } from "sonner";
import { 
  Atom, Radio, Sliders, AudioWaveform, Play, 
  Volume2, Upload, Grid, Download, ChevronDown, ChevronUp, 
  Settings, AlertCircle, CheckCircle, Info, Loader2, Maximize, Minimize
} from "lucide-react";

import QuantumControls from "@/components/QuantumControls";
import VisualAnalyzer from "@/components/VisualAnalyzer";
import QuantumPad from "@/components/QuantumPad";
import DAWTransport from "@/components/DAWTransport";
import QuantumAdvancedAudio from "@/components/QuantumAdvancedAudio";
import { toast } from "sonner";
import { quantumAudioEngine } from "@/lib/quantumAudioEngine";
import { AdvancedAudioSettings, defaultSettings as defaultAdvancedSettings } from "@/types/advancedAudioTypes";
import type { QuantumSettings } from "@/components/QuantumControls";

// Define the enhanced audio state type with all required properties
interface QuantumAudioState {
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  quantumProbabilities: Record<string, number>;
  circuitData: any;
  qpixlData?: Float32Array;
  // Add missing properties for TypeScript errors
  spectralAnalysis?: {
    frequencies: Float32Array;
    amplitudes: Float32Array;
    harmonicRatios: number[];
  };
  compressionMetrics?: {
    originalComplexity: number;
    compressedComplexity: number;
    compressionRatio: number;
  };
}

// Define the app status message type
interface AppStatus {
  message: string | null;
  type: 'success' | 'error' | 'info' | 'loading' | null;
  id?: string;
}

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [quantumSettings, setQuantumSettings] = useState<QuantumSettings | null>(null);
  const [advancedAudioSettings, setAdvancedAudioSettings] = useState<AdvancedAudioSettings>(defaultAdvancedSettings);
  const [currentTime, setCurrentTime] = useState<string>("00:00");
  const [totalTime, setTotalTime] = useState<string>("00:00");
  const [audioState, setAudioState] = useState<QuantumAudioState | null>(null);
  const [visualizerType, setVisualizerType] = useState<"waveform" | "frequency" | "quantum" | "qpixl">("quantum");
  const [temporalCoherence, setTemporalCoherence] = useState<number>(50);
  const [showAdvancedAudio, setShowAdvancedAudio] = useState<boolean>(false);
  const [isVisualizerMaximized, setIsVisualizerMaximized] = useState<boolean>(false);
  const [appStatus, setAppStatus] = useState<AppStatus>({ 
    message: "Welcome to Quantum Music Synthesizer", 
    type: 'info' 
  });
  
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSettingsRef = useRef<QuantumSettings | null>(null);
  const lastAdvancedSettingsRef = useRef<AdvancedAudioSettings | null>(null);

  // Initialize audio context on user interaction
  const initAudio = useCallback(() => {
    if (audioContext) return true;
    
    try {
      const engine = quantumAudioEngine;
      const context = engine.getAudioContext();
      const analyser = engine.getAnalyser();
      
      if (context && analyser) {
        setAudioContext(context);
        setAnalyserNode(analyser);
        setAppStatus({ message: "Audio engine initialized", type: 'success' });
        setTimeout(() => setAppStatus({ message: null, type: null }), 3000);
        return true;
      } else {
        throw new Error("Failed to get audio context");
      }
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      setAppStatus({ message: "Failed to initialize audio", type: 'error' });
      return false;
    }
  }, [audioContext]);

  const generateQuantumAudio = useCallback(async () => {
    if (!quantumSettings) {
      setAppStatus({ message: "No quantum settings configured", type: 'error' });
      return null;
    }
    
    try {
      if (!initAudio()) return null;
      
      // Apply advanced audio settings if available
      if (advancedAudioSettings) {
        quantumAudioEngine.setAdvancedAudioSettings(advancedAudioSettings);
      }
      
      setAppStatus({ message: "Generating quantum sound...", type: 'loading', id: "generate-audio" });
      const result = await quantumAudioEngine.generateQuantumSound(quantumSettings);
      setAudioState(result);
      lastSettingsRef.current = quantumSettings;
      lastAdvancedSettingsRef.current = advancedAudioSettings;
      
      if (quantumSettings.qpixlIntegration) {
        setVisualizerType("qpixl");
        setTemporalCoherence(quantumSettings.temporalCoherence);
      }
      
      // Format duration for display
      const minutes = Math.floor(result.duration / 60);
      const seconds = Math.floor(result.duration % 60);
      setTotalTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      setAppStatus({ message: "Quantum synthesis completed", type: 'success', id: "generate-audio" });
      setTimeout(() => setAppStatus(prev => prev.id === "generate-audio" ? { message: null, type: null } : prev), 3000);
      return result;
    } catch (error) {
      console.error("Failed to generate quantum audio:", error);
      setAppStatus({ message: "Failed to generate quantum audio", type: 'error' });
      return null;
    }
  }, [quantumSettings, advancedAudioSettings, initAudio]);

  const handlePlay = useCallback(async () => {
    if (!initAudio()) return;
    
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
      if (elapsed >= (stateToPlay?.duration || 0)) {
        // Instead of stopping, regenerate the audio for continuous play
        handleContinuousPlay();
        return;
      }
      
      const minutes = Math.floor(elapsed / 60);
      const seconds = Math.floor(elapsed % 60);
      setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 100);
    
    setAppStatus({ message: "Quantum synthesis started", type: 'success' });
  }, [audioState, audioContext, generateQuantumAudio, initAudio]);

  // New function for continuous playback
  const handleContinuousPlay = useCallback(async () => {
    if (!isPlaying) return;
    
    if (quantumSettings) {
      const result = await generateQuantumAudio();
      if (result && result.audioBuffer) {
        quantumAudioEngine.play(result.audioBuffer);
        // Reset timer
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        }
        
        const startTime = audioContext?.currentTime || 0;
        
        timerRef.current = window.setInterval(() => {
          if (!audioContext) return;
          
          const elapsed = audioContext.currentTime - startTime;
          if (elapsed >= (result?.duration || 0)) {
            // Continue the loop
            handleContinuousPlay();
            return;
          }
          
          const minutes = Math.floor(elapsed / 60);
          const seconds = Math.floor(elapsed % 60);
          setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 100);
      }
    }
  }, [isPlaying, quantumSettings, audioContext, generateQuantumAudio]);

  const handleStop = useCallback(() => {
    quantumAudioEngine.stop();
    setIsPlaying(false);
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setCurrentTime("00:00");
    setAppStatus({ message: "Synthesis stopped", type: 'info' });
  }, []);

  // Effect to regenerate audio when settings change while playing
  useEffect(() => {
    if (isPlaying && 
        (
          (quantumSettings && JSON.stringify(quantumSettings) !== JSON.stringify(lastSettingsRef.current))
          || 
          (advancedAudioSettings && JSON.stringify(advancedAudioSettings) !== JSON.stringify(lastAdvancedSettingsRef.current))
        )
       ) {
      const regenerateAudio = async () => {
        const result = await generateQuantumAudio();
        if (result && result.audioBuffer) {
          // Keep playing with new settings
          quantumAudioEngine.play(result.audioBuffer, true); // true for seamless transition
        }
      };
      
      regenerateAudio();
    }
  }, [quantumSettings, advancedAudioSettings, isPlaying, generateQuantumAudio]);

  const handleSave = () => {
    setAppStatus({ message: "Preset saved", type: 'success' });
  };

  const handleExport = () => {
    if (!audioState || !audioState.audioBuffer) {
      setAppStatus({ message: "No audio to export", type: 'error' });
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
        setAppStatus({ message: "Audio exported successfully", type: 'success' });
      });
    } catch (error) {
      console.error("Failed to export audio:", error);
      setAppStatus({ message: "Failed to export audio", type: 'error' });
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
    setAppStatus({ message: "Settings panel opened", type: 'info' });
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

  // Handle changes to advanced audio settings
  const handleAdvancedAudioChange = (settings: AdvancedAudioSettings) => {
    setAdvancedAudioSettings(settings);
    quantumAudioEngine.setAdvancedAudioSettings(settings);
  };

  // Toggle advanced audio panel
  const toggleAdvancedAudio = () => {
    setShowAdvancedAudio(!showAdvancedAudio);
  };

  // Update the volume control section to use the advancedAudioSettings
  const handleVolumeChange = (newVolume: number) => {
    if (advancedAudioSettings) {
      const updatedSettings: AdvancedAudioSettings = {
        ...advancedAudioSettings,
        masterVolume: newVolume
      };
      setAdvancedAudioSettings(updatedSettings);
      quantumAudioEngine.setAdvancedAudioSettings(updatedSettings);
    } else {
      // Initialize with default settings if none exist
      setAdvancedAudioSettings({
        ...defaultAdvancedSettings,
        masterVolume: newVolume
      });
      quantumAudioEngine.setAdvancedAudioSettings({
        ...defaultAdvancedSettings,
        masterVolume: newVolume
      });
    }
  };

  // Status Bar component
  const StatusBar: React.FC<{ status: AppStatus }> = ({ status }) => {
    if (!status.message) return null;
    
    let icon = null;
    let textColor = "text-white";
    let bgColor = "bg-slate-800";
    
    switch (status.type) {
      case 'success':
        icon = <CheckCircle className="w-4 h-4 text-green-400" />;
        textColor = "text-green-300";
        bgColor = "bg-green-900/50 border-green-700/50";
        break;
      case 'error':
        icon = <AlertCircle className="w-4 h-4 text-red-400" />;
        textColor = "text-red-300";
        bgColor = "bg-red-900/50 border-red-700/50";
        break;
      case 'info':
        icon = <Info className="w-4 h-4 text-blue-400" />;
        textColor = "text-blue-300";
        bgColor = "bg-blue-900/50 border-blue-700/50";
        break;
      case 'loading':
        icon = <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
        textColor = "text-yellow-300";
        bgColor = "bg-yellow-900/50 border-yellow-700/50";
        break;
    }
    
    return (
      <div 
        className={`py-2 px-4 border-t ${bgColor} transition-all duration-300`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center justify-center gap-2">
          {icon}
          <span className={`${textColor}`}>{status.message}</span>
          {status.type === 'error' && (
            <button 
              onClick={() => setAppStatus({ message: null, type: null })} 
              className="ml-auto text-gray-400 hover:text-white"
            >
              &times;
            </button>
          )}
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-quantum-bg text-white overflow-hidden flex flex-col">
      {/* Hidden file input for uploads */}
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".mid,.midi,.wav,.mp3"
        onChange={handleFileChange}
      />
      
      {/* Header */}
      <header className="p-3 bg-quantum-surface/50 backdrop-blur-md border-b border-purple-800/30 shadow-lg">
        <h1 className="text-2xl font-bold gradient-text flex items-center justify-center gap-3">
          <Atom className="h-7 w-7 text-quantum-accent animate-pulse-glow" />
          Quantum Music Synthesizer
        </h1>
      </header>

      {/* Main DAW Interface */}
      <main className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        {/* Top Section: Controls (Left), Visualizer (Right) */}
        <div className={`flex-1 grid grid-cols-1 ${isVisualizerMaximized ? '' : 'lg:grid-cols-[minmax(320px,360px)_1fr]'} gap-3 min-h-0`}>
          {/* Left Panel: Quantum Controls & Matrix - Hidden when maximized */}
          {!isVisualizerMaximized && (
            <aside className="flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
              {/* Quantum Parameters */}
              <div className="neumorph p-4 rounded-xl">
                <div className="flex items-center mb-4">
                  <Atom className="h-5 w-5 text-quantum-accent mr-2" />
                  <h2 className="text-xl font-bold">Quantum Parameters</h2>
                </div>
                
                <QuantumControls 
                  onChange={setQuantumSettings}
                />
              </div>
              
              {/* Quantum Matrix */}
              <div className="neumorph p-4 rounded-xl">
                <div className="flex items-center mb-4">
                  <Grid className="h-5 w-5 text-quantum-accent mr-2" />
                  <h2 className="text-lg font-bold">Quantum Matrix</h2>
                </div>
                
                <div className="h-48">
                  <QuantumPad
                    xLabel="Decoherence"
                    yLabel="Amplitude"
                    onChange={handleQuantumPadChange}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </aside>
          )}

          {/* Main Visualizer */}
          <section className={`neumorph p-4 rounded-xl flex flex-col overflow-hidden ${isVisualizerMaximized ? 'col-span-full' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <AudioWaveform className="h-5 w-5 text-quantum-accent mr-2" />
                <h2 className="text-xl font-bold">Quantum Visualizer</h2>
              </div>
              
              <button 
                onClick={() => setIsVisualizerMaximized(!isVisualizerMaximized)} 
                className="neumorph-button p-2 rounded-full"
                title={isVisualizerMaximized ? "Minimize" : "Maximize"}
              >
                {isVisualizerMaximized ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="flex-1 min-h-0 overflow-hidden">
              <VisualAnalyzer 
                type={visualizerType}
                color="#9b87f5"
                audioContext={audioContext}
                analyserNode={analyserNode}
                qpixlData={audioState?.qpixlData}
                temporalCoherence={temporalCoherence}
                className="w-full h-full"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-4">
              <button 
                className={`${visualizerType === 'waveform' ? 'neumorph-active' : 'neumorph-button'} flex items-center justify-center gap-2 text-sm p-2`}
                onClick={() => setVisualizerType('waveform')}
              >
                <AudioWaveform className="h-4 w-4" />
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
          </section>
        </div>

        {/* Bottom Section: Audio Output & Controls */}
        <div className={`grid grid-cols-1 ${isVisualizerMaximized ? 'hidden' : 'lg:grid-cols-[1fr_340px]'} gap-3 pt-1`}>
          {/* Left Side: Audio Output & Advanced Audio Controls */}
          <section className="flex flex-col gap-3">
            {/* Audio Output */}
            <div className="neumorph p-4 rounded-xl">
              <div className="flex items-center mb-4">
                <Radio className="h-5 w-5 text-quantum-accent mr-2" />
                <h2 className="text-xl font-bold">Quantum Audio Output</h2>
              </div>
              
              <div className="neumorph h-24 rounded-xl overflow-hidden mb-4">
                <VisualAnalyzer 
                  type="waveform"
                  color="#9b87f5"
                  audioContext={audioContext}
                  analyserNode={analyserNode}
                  className="w-full h-full"
                />
              </div>
              
              {/* DAW Transport */}
              <DAWTransport 
                onPlay={handlePlay}
                onStop={handleStop}
                onSave={handleSave}
                onExport={handleExport}
                onSettings={handleSettings}
                isPlaying={isPlaying}
              />
              
              {/* Audio Progress */}
              <div className="flex items-center justify-between mt-4">
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

            {/* Advanced Audio Controls */}
            <div className="neumorph p-4 rounded-xl">
              <button
                onClick={toggleAdvancedAudio}
                className="w-full flex items-center justify-between mb-2"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-quantum-accent" />
                  <h3 className="text-lg font-medium">Advanced Audio Synthesis</h3>
                </div>
                {showAdvancedAudio ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              
              {showAdvancedAudio && (
                <div className="mt-4 border-t border-quantum-light pt-4">
                  <QuantumAdvancedAudio 
                    onChange={handleAdvancedAudioChange}
                    initialSettings={advancedAudioSettings}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Right Side: Measurement Analysis & Quantum Circuit */}
          <aside className="hidden lg:flex flex-col gap-3">
            {/* Measurement Analysis */}
            <div className="neumorph p-4 rounded-xl">
              <div className="flex items-center mb-4">
                <Radio className="h-5 w-5 text-quantum-accent mr-2" />
                <h2 className="text-lg font-bold">Measurement Analysis</h2>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {audioState && audioState.quantumProbabilities ? 
                  Object.entries(audioState.quantumProbabilities)
                    .slice(0, 4)
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
                      {audioState.spectralAnalysis.harmonicRatios?.length > 0 && (
                        <span>Harmony ratio: {audioState.spectralAnalysis.harmonicRatios[0].toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quantum Circuit */}
            <div className="neumorph p-4 rounded-xl">
              <div className="flex items-center mb-4">
                <Sliders className="h-5 w-5 text-quantum-accent mr-2" />
                <h2 className="text-lg font-bold">Quantum Circuit</h2>
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
          </aside>
        </div>

        {/* Status Bar */}
        <StatusBar status={appStatus} />
      </main>
    </div>
  );
};

export default Index;
