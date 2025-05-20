
import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { 
  Atom, Radio, Sliders, AudioWaveform, Play, 
  Volume2, Upload, Grid, Download, CheckCircle, 
  AlertCircle, Info, Loader2, Maximize, Minimize,
  ChevronDown, ChevronUp, Settings as SettingsIconLucide
} from "lucide-react";

import QuantumControls from "@/components/QuantumControls";
import VisualAnalyzer from "@/components/VisualAnalyzer";
import QuantumPad from "@/components/QuantumPad";
import DAWTransport from "@/components/DAWTransport";
import QuantumAdvancedAudio from "@/components/QuantumAdvancedAudio";
import { AdvancedAudioSettings, defaultAdvancedAudioSettings } from "@/types/advancedAudioTypes";
import { quantumAudioEngine } from "@/lib/quantumAudioEngine";
import type { QuantumSettings } from "@/components/QuantumControls";

// Define interfaces for analysis data
interface SpectralAnalysisData {
  frequencies: Float32Array;
  amplitudes: Float32Array;
  harmonicRatios?: number[];
}

interface CompressionMetricsData {
  originalComplexity?: number;
  compressedComplexity?: number;
  compressionRatio?: number;
}

interface QuantumCircuitInfo {
  depth?: number;
  total_gate_count?: number;
  operations?: Record<string, number>;
  connectivity_pairs_sample?: Array<[number, number]>;
  qubits?: number;
  gates?: Record<string, any>[];
}

// Define the audio state type
interface QuantumAudioState {
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  quantumProbabilities: Record<string, number>;
  circuitData: QuantumCircuitInfo | null;
  qpixlData?: Float32Array;
  spectralAnalysis?: SpectralAnalysisData | null;
  compressionMetrics?: CompressionMetricsData | null;
}

// App Status Message Type
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
  const [advancedAudioSettings, setAdvancedAudioSettings] = useState<AdvancedAudioSettings>(defaultAdvancedAudioSettings);
  const [currentTime, setCurrentTime] = useState<string>("00:00");
  const [totalTime, setTotalTime] = useState<string>("00:00");
  const [audioState, setAudioState] = useState<QuantumAudioState | null>(null);
  const [visualizerType, setVisualizerType] = useState<"waveform" | "frequency" | "quantum" | "qpixl">("quantum");
  const [temporalCoherence, setTemporalCoherence] = useState<number>(50);
  const [showAdvancedAudio, setShowAdvancedAudio] = useState<boolean>(false);
  const [isVisualizerMaximized, setIsVisualizerMaximized] = useState(false);
  const [appStatus, setAppStatus] = useState<AppStatus>({ message: "Welcome! Click to generate audio", type: 'info' });
  
  // For Python backend data simulation
  const [pythonOutput, setPythonOutput] = useState<{
    qpixlStateArray: Float32Array | null;
    analysisDataFromPython: any | null;
  }>({ qpixlStateArray: null, analysisDataFromPython: null });
  
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSettingsRef = useRef<QuantumSettings | null>(null);
  const lastAdvancedSettingsRef = useRef<AdvancedAudioSettings | null>(null);

  // Initialize audio context on user interaction
  const initAudio = () => {
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
  };

  const generateQuantumAudio = async () => {
    if (!quantumSettings) {
      setAppStatus({ message: "No quantum settings configured", type: 'error' });
      return;
    }
    
    try {
      initAudio();
      
      // Apply advanced audio settings if available
      if (advancedAudioSettings) {
        quantumAudioEngine.setAdvancedAudioSettings(advancedAudioSettings);
      }

      setAppStatus({ message: "Generating quantum audio...", type: 'loading', id: "audio-gen" });
      
      // Simulate Python backend response for QPIXL data
      const mockNumPixels = 2**(quantumSettings.qubits || 4);
      const qpixlStateValues = Array.from(
        {length: mockNumPixels}, 
        (_,i) => (Math.sin(i*0.5 + Date.now()*0.001) * 0.4 + 0.5 + (Math.random()-0.5)*0.2)
      );
      
      const mockPythonAnalysis = { 
        altered_qpixl_circuit_info: { 
          depth: 5 + quantumSettings.qubits, 
          total_gate_count: 20 + quantumSettings.qubits*5, 
          operations: {"cx":10, "ry":10},
          qubits: quantumSettings.qubits,
          gates: [{type: "H", qubit: 0}, {type: "CX", target: 1, control: 0}]
        },
        measurement_analysis_display: Object.fromEntries(
          qpixlStateValues.slice(0,8).map(
            (p,i) => [i.toString(2).padStart(quantumSettings.qubits||2, '0'), p]
          )
        ),
        quantum_matrix_data: { 
          x: qpixlStateValues[0] || 0.5, 
          y: qpixlStateValues[1] || 0.5 
        }
      };
      
      const qpixlStateArray = new Float32Array(qpixlStateValues);
      setPythonOutput({ 
        qpixlStateArray, 
        analysisDataFromPython: mockPythonAnalysis 
      });
      
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
      
      setAppStatus({ message: "Quantum synthesis completed", type: 'success' });
      setTimeout(() => setAppStatus({ message: null, type: null }), 3000);
      return result;
    } catch (error) {
      console.error("Failed to generate quantum audio:", error);
      setAppStatus({ message: "Failed to generate quantum audio", type: 'error' });
      return null;
    }
  };

  const handlePlayPause = () => {
    if (!initAudio()) return;

    if (isPlaying) {
      quantumAudioEngine.stop();
      setIsPlaying(false);
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setCurrentTime("00:00");
      setAppStatus({ message: "Playback stopped", type: 'info' });
      setTimeout(() => setAppStatus({ message: null, type: null }), 1500);
    } else {
      if (!audioState || !audioState.audioBuffer) {
        generateQuantumAudio().then(result => {
          if (result && result.audioBuffer) {
            playAudio(result.audioBuffer);
          }
        });
        return;
      }
      
      playAudio(audioState.audioBuffer);
    }
  };

  const playAudio = (buffer: AudioBuffer) => {
    quantumAudioEngine.play(buffer);
    setIsPlaying(true);
    
    // Start timer for tracking playback position
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    const startTime = audioContext?.currentTime || 0;
    
    timerRef.current = window.setInterval(() => {
      if (!audioContext) return;
      
      const elapsed = audioContext.currentTime - startTime;
      if (elapsed >= buffer.duration) {
        handlePlayPause(); // Stop playback when done
        return;
      }
      
      const minutes = Math.floor(elapsed / 60);
      const seconds = Math.floor(elapsed % 60);
      setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 100);
    
    setAppStatus({ message: "Playback started", type: 'success' });
    setTimeout(() => setAppStatus({ message: null, type: null }), 1500);
  };

  const triggerFullGenerationPipeline = async () => {
    setAppStatus({ message: "Initializing quantum synthesis...", type: 'loading' });
    const result = await generateQuantumAudio();
    if (!result) {
      setAppStatus({ message: "Generation failed", type: 'error' });
    }
  };

  const handleQuantumSettingsChange = (settings: QuantumSettings) => {
    setQuantumSettings(settings);
  };

  const handleAdvancedAudioSettingsChange = (settings: AdvancedAudioSettings) => {
    setAdvancedAudioSettings(settings);
    if (audioContext) {
      quantumAudioEngine.setAdvancedAudioSettings(settings);
    }
  };

  // Cleanup function for audio context and timers
  useEffect(() => {
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

  // Derived data for visualizers
  const qpixlDataForVisualAnalyzer = pythonOutput.qpixlStateArray;
  const temporalCoherenceForVis = advancedAudioSettings.qpixlTemporalCoherenceForVisualizer ?? 
                                (quantumSettings?.temporalCoherence ?? 50);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-gray-200 overflow-hidden print:hidden">
      <header className="p-3 bg-slate-900/70 backdrop-blur-md border-b border-purple-800/40 text-center shadow-lg">
        <h1 className="text-xl font-bold gradient-text">Quantum Music Synthesizer</h1>
      </header>

      <main className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        {/* TOP ROW: Controls on Left, Main Visualizer on Right */}
        <div className={`flex-1 grid grid-cols-1 ${isVisualizerMaximized ? '' : 'lg:grid-cols-[minmax(320px,380px)_1fr]'} gap-3 min-h-0`}>
          
          {/* LEFT PANEL (Quantum Params & Quantum Matrix) - Conditionally hidden if visualizer is maximized */}
          {!isVisualizerMaximized && (
            <aside className="bg-slate-900/30 p-1 flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 rounded-lg">
              <div className="quantum-panel-neumorph p-4">
                <QuantumControls onChange={handleQuantumSettingsChange} />
              </div>
              <div className="quantum-panel-neumorph p-4">
                <h3 className="text-base font-semibold text-purple-300 mb-2">Quantum Matrix</h3>
                <QuantumPad 
                  xLabel="Decoherence"
                  yLabel="Amplitude"
                  initialX={pythonOutput.analysisDataFromPython?.quantum_matrix_data?.x ?? 0.5}
                  initialY={pythonOutput.analysisDataFromPython?.quantum_matrix_data?.y ?? 0.5}
                  onChange={(x, y) => {
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
                  }}
                  className="w-full h-48"
                />
              </div>
            </aside>
          )}

          {/* MAIN VISUALIZER PANEL (Middle/Right, expands if left is hidden) */}
          <section className={`quantum-panel-neumorph flex flex-col p-1 overflow-hidden ${isVisualizerMaximized ? 'col-span-full' : ''}`}>
            <div className="flex items-center justify-between p-2 border-b border-purple-700/20 mb-1">
              <h2 className="text-base font-semibold text-purple-300">Quantum Visualizer</h2>
              <button onClick={() => setIsVisualizerMaximized(!isVisualizerMaximized)} 
                      className="p-1 hover:bg-purple-700/30 rounded text-purple-400" 
                      title={isVisualizerMaximized ? "Minimize Visualizer" : "Maximize Visualizer"}>
                {isVisualizerMaximized ? <Minimize size={16}/> : <Maximize size={16}/>}
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <VisualAnalyzer
                audioContext={audioContext}
                analyserNode={analyserNode}
                type={(qpixlDataForVisualAnalyzer && qpixlDataForVisualAnalyzer.length > 0) ? "qpixl" : "quantum"}
                qpixlData={qpixlDataForVisualAnalyzer}
                temporalCoherence={temporalCoherenceForVis}
                className="w-full h-full rounded-md"
                color="#a78bfa"
                backgroundColor="transparent"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-2 p-1">
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

        {/* BOTTOM ROW: Audio Output & Controls + Other Info Panels */}
        {!isVisualizerMaximized && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3 pt-1 max-h-[40vh] lg:max-h-[33vh]">
            {/* Left side of bottom row: Audio Output & Advanced Audio Controls */}
            <section className="quantum-panel-neumorph p-4 flex flex-col gap-3 overflow-y-auto scrollbar-thin">
              <div>
                <h3 className="text-base font-semibold text-purple-300 mb-2">Audio Output & Transport</h3>
                <DAWTransport
                  onPlay={handlePlayPause}
                  onStop={handlePlayPause}
                  onSave={() => setAppStatus({ message: "Preset saved", type: 'success' })}
                  onExport={() => setAppStatus({ message: "Export feature coming soon", type: 'info' })}
                  onSettings={() => setAppStatus({ message: "Settings panel opened", type: 'info' })}
                  isPlaying={isPlaying}
                />
                
                {/* Audio timeline */}
                <div className="flex items-center justify-between mt-4">
                  <div className="font-mono text-sm">{currentTime} / {totalTime}</div>
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
                </div>
              </div>
              
              {/* Advanced Audio - now clearly under Audio Output */}
              <div>
                <button
                  onClick={() => { initAudio(); setShowAdvancedAudio(prev => !prev); }}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-purple-700/10 transition-colors mb-2 text-purple-300"
                >
                  <div className="flex items-center gap-2">
                    <SettingsIconLucide size={16} />
                    <span className="font-medium text-sm">Advanced Audio Synthesis</span>
                  </div>
                  {showAdvancedAudio ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {showAdvancedAudio && (
                  <div className="border-t border-purple-700/20 pt-3">
                    <QuantumAdvancedAudio
                      onChange={handleAdvancedAudioSettingsChange}
                      initialSettings={advancedAudioSettings}
                    />
                  </div>
                )}
              </div>
            </section>
            
            {/* Right side of bottom row: Measurement & Circuit (if not maximized) */}
            <aside className="hidden lg:flex flex-col gap-3 overflow-hidden">
              <div className="quantum-panel-neumorph p-3 flex-1 min-h-0 flex flex-col">
                <h3 className="text-sm font-semibold text-purple-300 mb-2">Measurement Analysis</h3>
                <div className="flex-1 grid grid-cols-2 gap-1.5 text-xs overflow-y-auto scrollbar-thin">
                  {pythonOutput.analysisDataFromPython?.measurement_analysis_display && 
                   Object.entries(pythonOutput.analysisDataFromPython.measurement_analysis_display).map(([state, prob]) => (
                    <div key={state} className="bg-slate-800/50 p-1.5 rounded text-center">
                      <div className="font-mono text-[10px] text-purple-400">{state}</div>
                      <div className="text-sm font-bold text-cyan-300">{(Number(prob) * 100).toFixed(0)}%</div>
                    </div>
                  ))}
                  {(!pythonOutput.analysisDataFromPython?.measurement_analysis_display || 
                   Object.keys(pythonOutput.analysisDataFromPython.measurement_analysis_display).length === 0) && (
                    <p className="col-span-2 text-gray-500 text-center mt-4 text-xs">No measurement data available yet.</p>
                  )}
                </div>
              </div>
              <div className="quantum-panel-neumorph p-3 flex-1 min-h-0 flex flex-col">
                <h3 className="text-sm font-semibold text-purple-300 mb-2">Quantum Circuit Info</h3>
                <div className="text-xs text-gray-400 whitespace-pre-wrap overflow-auto flex-1 scrollbar-thin">
                  {pythonOutput.analysisDataFromPython?.altered_qpixl_circuit_info ? (
                    <div>
                      <p>Depth: {pythonOutput.analysisDataFromPython.altered_qpixl_circuit_info.depth}</p>
                      <p>Gates: {pythonOutput.analysisDataFromPython.altered_qpixl_circuit_info.total_gate_count}</p>
                      <p>Qubits: {pythonOutput.analysisDataFromPython.altered_qpixl_circuit_info.qubits || '?'}</p>
                      <p>Operations: {Object.entries(pythonOutput.analysisDataFromPython.altered_qpixl_circuit_info.operations || {})
                          .map(([key, value]) => `${key}:${value}`).join(', ')}</p>
                    </div>
                  ) : (
                    <p>Circuit data will appear after generation.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
        
        {/* StatusBar - Integrated at the bottom of the main flex column */}
        {appStatus.message && (
          <div className={`p-2 text-center text-xs border-t transition-opacity duration-300 ease-in-out print:hidden ${
            appStatus.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
            appStatus.type === 'error'   ? 'bg-red-500/20 border-red-500/30 text-red-300' :
            appStatus.type === 'info'    ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' :
            appStatus.type === 'loading' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' :
            'bg-slate-700/50 border-slate-600/50 text-gray-300'
          }`} role="alert">
            <div className="flex items-center justify-center gap-2 max-w-3xl mx-auto">
              {appStatus.type === 'success' && <CheckCircle size={14} />}
              {appStatus.type === 'error' && <AlertCircle size={14} />}
              {appStatus.type === 'info' && <Info size={14} />}
              {appStatus.type === 'loading' && <Loader2 size={14} className="animate-spin" />}
              <span>{appStatus.message}</span>
              {appStatus.type === 'error' && (
                <button 
                  onClick={() => setAppStatus({message: null, type: null})} 
                  className="ml-2 text-xs hover:text-white p-0.5 leading-none"
                >
                  ✖
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
