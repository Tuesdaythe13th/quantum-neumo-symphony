import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { 
  Atom, Radio, Settings, 
  ArrowUp, ArrowDown, 
  Maximize2, Minimize2
} from "lucide-react";

import QuantumControls from "@/components/QuantumControls";
import VisualAnalyzer from "@/components/VisualAnalyzer";
import QuantumPad from "@/components/QuantumPad";
import DAWTransport from "@/components/DAWTransport";
import QuantumAdvancedAudio from "@/components/QuantumAdvancedAudio";
import { toast } from "@/hooks/use-toast";
import { quantumAudioEngine } from "@/lib/quantumAudioEngine";
import { AdvancedAudioSettings, defaultSettings as defaultAdvancedSettings } from "@/types/advancedAudioTypes";
import type { QuantumSettings } from "@/components/QuantumControls";
import { QuantumAudioState } from "@/types/quantum";

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
  const [engineAudioState, setEngineAudioState] = useState<QuantumAudioState | null>(null);
  const [pythonOutput, setPythonOutput] = useState<{ qpixlStateArray: Float32Array | null, analysisDataFromPython: any | null }>({
    qpixlStateArray: null,
    analysisDataFromPython: null
  });
  
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSettingsRef = useRef<QuantumSettings | null>(null);
  const lastAdvancedSettingsRef = useRef<AdvancedAudioSettings | null>(null);

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

  const mockPythonProcess = async () => {
    const mockPixelCount = 256; // 16x16 grid
    const qpixlStateValues = new Array(mockPixelCount);
    
    for (let i = 0; i < mockPixelCount; i++) {
      const x = (i % 16) / 16;
      const y = Math.floor(i / 16) / 16;
      qpixlStateValues[i] = Math.sin(x * 5) * Math.cos(y * 7) * 0.5 + 0.5;
    }
    
    const mockPythonAnalysis = {
      entropy: Math.random() * 0.5 + 0.5,
      coherence: Math.random() * 0.7 + 0.3,
      complexity: Math.random() * 0.8 + 0.2
    };
    
    return { qpixlStateValues, mockPythonAnalysis };
  };

  const updateVisualizationOnly = async () => {
    if (!quantumSettings) return;
    
    try {
      const quantumState = await quantumAudioEngine.generateQuantumSound(quantumSettings);
      
      if (quantumState.qpixlData) {
        setPythonOutput(prev => ({
          ...prev,
          qpixlStateArray: quantumState.qpixlData
        }));
        
        if (quantumSettings.qpixlIntegration) {
          setVisualizerType("qpixl");
          setTemporalCoherence(quantumSettings.temporalCoherence);
        } else {
          setVisualizerType("quantum");
        }
      }
    } catch (error) {
      console.log("Visualization update failed, using mock data");
      const mockQpixlData = new Float32Array(16);
      for (let i = 0; i < 16; i++) {
        mockQpixlData[i] = Math.random() * quantumSettings.superposition / 100;
      }
      setPythonOutput(prev => ({
        ...prev,
        qpixlStateArray: mockQpixlData
      }));
    }
  };

  const triggerFullGenerationPipeline = async () => {
    if (!quantumSettings) {
      toast.error("No quantum settings configured");
      return null;
    }
    
    try {
      const { qpixlStateValues, mockPythonAnalysis } = await mockPythonProcess();
      const qpixlStateArrayFromPython = new Float32Array(qpixlStateValues);
      setPythonOutput({ 
        qpixlStateArray: qpixlStateArrayFromPython, 
        analysisDataFromPython: mockPythonAnalysis 
      });
      
      initAudio();
      quantumAudioEngine.setAdvancedAudioSettings(advancedAudioSettings);
      quantumAudioEngine.setQpixlData(qpixlStateArrayFromPython);
      
      const result = await quantumAudioEngine.generateQuantumSound(quantumSettings);
      setEngineAudioState(result);
      
      if (quantumSettings.qpixlIntegration) {
        setVisualizerType("qpixl");
        setTemporalCoherence(quantumSettings.temporalCoherence);
      }
      
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

  const generateQuantumAudio = async () => {
    return triggerFullGenerationPipeline();
  };

  const handlePlay = async () => {
    initAudio();
    
    let stateToPlay = audioState;
    if (!stateToPlay || !stateToPlay.audioBuffer) {
      const result = await generateQuantumAudio();
      if (!result || !result.audioBuffer) return;
      stateToPlay = result;
    }
    
    quantumAudioEngine.play(stateToPlay.audioBuffer);
    setIsPlaying(true);
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    const startTime = audioContext?.currentTime || 0;
    
    timerRef.current = window.setInterval(() => {
      if (!audioContext) return;
      
      const elapsed = audioContext.currentTime - startTime;
      if (elapsed >= stateToPlay!.duration) {
        handleContinuousPlay();
        return;
      }
      
      const minutes = Math.floor(elapsed / 60);
      const seconds = Math.floor(elapsed % 60);
      setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 100);
    
    toast.success("Quantum synthesis started");
  };

  const handleContinuousPlay = async () => {
    if (!isPlaying) return;
    
    if (quantumSettings) {
      const result = await generateQuantumAudio();
      if (result && result.audioBuffer) {
        quantumAudioEngine.play(result.audioBuffer);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        }
        
        const startTime = audioContext?.currentTime || 0;
        
        timerRef.current = window.setInterval(() => {
          if (!audioContext) return;
          
          const elapsed = audioContext.currentTime - startTime;
          if (elapsed >= result.duration) {
            handleContinuousPlay();
            return;
          }
          
          const minutes = Math.floor(elapsed / 60);
          const seconds = Math.floor(elapsed % 60);
          setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 100);
      }
    }
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

  useEffect(() => {
    if (quantumSettings) {
      lastSettingsRef.current = quantumSettings;
      updateVisualizationOnly();
    }
  }, [quantumSettings]);

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
          quantumAudioEngine.play(result.audioBuffer, true);
        }
      };
      
      regenerateAudio();
    }
  }, [quantumSettings, advancedAudioSettings, isPlaying]);

  const handleSave = () => {
    toast.success("Preset saved");
  };

  const handleExport = () => {
    if (!audioState || !audioState.audioBuffer) {
      toast.error("No audio to export");
      return;
    }
    
    try {
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
        const wavBlob = audioBufferToWave(renderedBuffer);
        const url = URL.createObjectURL(wavBlob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = "quantum-synthesis.wav";
        a.click();
        
        URL.revokeObjectURL(url);
        toast.success("Audio exported successfully");
      });
    } catch (error) {
      console.error("Failed to export audio:", error);
      toast.error("Failed to export audio");
    }
  };

  const audioBufferToWave = (buffer: AudioBuffer): Blob => {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);
    
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
          toast.info("MIDI file support coming soon!");
        } else if (file.type === 'audio/wav' || file.type === 'audio/x-wav' || file.type === 'audio/mp3') {
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
    console.log("Quantum pad values:", { x, y });
    
    if (quantumSettings && audioContext) {
      const newSettings = {
        ...quantumSettings,
        entanglement: Math.round(x * 100),
        superposition: Math.round(y * 100)
      };
      
      setQuantumSettings(newSettings);
    }
  };

  const handleAdvancedAudioChange = (settings: AdvancedAudioSettings) => {
    setAdvancedAudioSettings(settings);
    quantumAudioEngine.setAdvancedAudioSettings(settings);
  };

  const toggleAdvancedAudio = () => {
    setShowAdvancedAudio(!showAdvancedAudio);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (advancedAudioSettings) {
      const updatedSettings: AdvancedAudioSettings = {
        ...advancedAudioSettings,
        masterVolume: newVolume
      };
      setAdvancedAudioSettings(updatedSettings);
      quantumAudioEngine.setAdvancedAudioSettings(updatedSettings);
    } else {
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

  return (
    <div className="min-h-screen bg-quantum-bg text-white p-4 md:p-6 overflow-hidden">
      <Toaster position="top-right" />
      
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".mid,.midi,.wav,.mp3"
        onChange={handleFileChange}
      />
      
      <header className="mb-6">
        <h1 className="text-4xl font-bold gradient-text flex items-center justify-center gap-3">
          <Atom className="h-8 w-8 text-quantum-accent animate-pulse-glow" />
          Quantum Music Synthesizer
        </h1>
        <p className="text-center text-quantum-muted max-w-2xl mx-auto mt-2">
          A neumorphic DAW interface powered by quantum computing principles
        </p>
      </header>

      <div className="neumorph p-6 rounded-xl">
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
            <ArrowUp className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleExport}
            className="neumorph-button p-3 rounded-full ml-2"
            title="Export Audio"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="neumorph p-4 rounded-xl">
            <div className="flex items-center mb-4">
              <Atom className="h-5 w-5 text-quantum-accent mr-2" />
              <h2 className="text-xl font-bold">Quantum Visualizer</h2>
            </div>
            
            <div className="h-52 rounded-xl overflow-hidden">
              <VisualAnalyzer 
                type={visualizerType}
                color="#9b87f5"
                audioContext={audioContext}
                analyserNode={analyserNode}
                qpixlData={pythonOutput.qpixlStateArray}
                temporalCoherence={quantumSettings?.temporalCoherence ?? 50}
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-4">
              <button 
                className={`${visualizerType === 'waveform' ? 'neumorph-active' : 'neumorph-button'} flex items-center justify-center gap-2 text-sm p-2`}
                onClick={() => setVisualizerType('waveform')}
              >
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Waveform</span>
              </button>
              
              <button 
                className={`${visualizerType === 'frequency' ? 'neumorph-active' : 'neumorph-button'} flex items-center justify-center gap-2 text-sm p-2`}
                onClick={() => setVisualizerType('frequency')}
              >
                <Maximize2 className="h-4 w-4" />
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
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">QPIXL</span>
              </button>
            </div>
          </div>

          <div className="neumorph p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-quantum-accent mr-2" />
                <h2 className="text-xl font-bold">Advanced Audio Synthesis</h2>
              </div>
              <button
                onClick={toggleAdvancedAudio}
                className="neumorph-button p-2 rounded-lg text-sm"
              >
                {showAdvancedAudio ? "Hide Details" : "Show Details"}
              </button>
            </div>
            
            {showAdvancedAudio ? (
              <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
                <QuantumAdvancedAudio 
                  onChange={handleAdvancedAudioChange}
                  initialSettings={advancedAudioSettings}
                />
              </div>
            ) : (
              <div className="p-4 text-center text-quantum-muted">
                <p>Control advanced audio synthesis parameters</p>
                <button
                  onClick={toggleAdvancedAudio}
                  className="mt-4 neumorph p-2 rounded-lg text-sm w-full"
                >
                  Show Advanced Controls
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="space-y-6">
            <div className="neumorph p-4 rounded-xl">
              <div className="flex items-center mb-4">
                <Settings className="h-5 w-5 text-quantum-accent mr-2" />
                <h2 className="text-xl font-bold">Quantum Matrix</h2>
              </div>
              
              <div className="h-48 neumorph rounded-xl flex items-center justify-center">
                <div className="text-quantum-accent text-center w-full p-4">
                  <div className="text-xl mb-2">Quantum Matrix Processor</div>
                  <div className="text-sm text-quantum-muted mb-4">
                    Generate quantum sound patterns with matrix operations
                  </div>
                  
                  <div className="h-24 mt-2">
                    <QuantumPad
                      xLabel="Decoherence"
                      yLabel="Amplitude"
                      onChange={handleQuantumPadChange}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="neumorph p-4 rounded-xl">
              <div className="flex items-center mb-4">
                <Atom className="h-5 w-5 text-quantum-accent mr-2" />
                <h2 className="text-xl font-bold">Quantum Parameters</h2>
              </div>
              
              <QuantumControls 
                onChange={setQuantumSettings}
              />
            </div>
          </div>

          <div className="neumorph p-4 rounded-xl lg:col-span-2">
            <div className="flex items-center mb-4">
              <Radio className="h-5 w-5 text-quantum-accent mr-2" />
              <h2 className="text-xl font-bold">Quantum Audio Output</h2>
            </div>
            
            <div className="mt-4">
              <div className="neumorph h-28 rounded-xl overflow-hidden">
                <VisualAnalyzer 
                  type="waveform"
                  color="#9b87f5"
                  audioContext={audioContext}
                  analyserNode={analyserNode}
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <button
                  className={`${isPlaying ? "neumorph-active" : "neumorph"} p-3 rounded-full`}
                  onClick={isPlaying ? handleStop : handlePlay}
                >
                  {isPlaying ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                
                <div className="flex-1 mx-4">
                  <div className="bg-quantum-light h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-quantum-accent h-full" 
                      style={{ 
                        width: engineAudioState && engineAudioState.duration > 0 
                          ? `${(parseFloat(currentTime.split(':')[0]) * 60 + parseFloat(currentTime.split(':')[1])) / engineAudioState.duration * 100}%` 
                          : "0%" 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="font-mono text-sm">{currentTime} / {totalTime}</div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <Minimize2 className="h-4 w-4" />
                <div className="w-full">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={advancedAudioSettings?.masterVolume || 0.7}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-quantum-light rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="neumorph p-4 rounded-xl">
                <div className="flex items-center mb-4">
                  <Settings className="h-5 w-5 text-quantum-accent mr-2" />
                  <h2 className="text-xl font-bold">Quantum Circuit</h2>
                </div>
                
                <div className="h-36 quantum-grid flex items-center justify-center rounded-lg">
                  {engineAudioState?.circuitData ? (
                    <div className="grid grid-cols-1 gap-4 w-full">
                      <div className="text-center">
                        <div className="text-quantum-accent text-lg font-medium mb-2">
                          Circuit with {engineAudioState.circuitData.qubits} qubits
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(engineAudioState.circuitData.gates || {})
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
                
                {engineAudioState?.compressionMetrics && (
                  <div className="mt-2">
                    <h3 className="text-xs font-medium mb-1">Quantum Compression</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="neumorph p-1 rounded-lg text-center">
                        <div className="text-xs text-quantum-muted">Original</div>
                        <div className="text-xs font-medium">
                          {engineAudioState.compressionMetrics.originalComplexity?.toFixed(2)}
                        </div>
                      </div>
                      <div className="neumorph p-1 rounded-lg text-center">
                        <div className="text-xs text-quantum-muted">Compressed</div>
                        <div className="text-xs font-medium">
                          {engineAudioState.compressionMetrics.compressedComplexity?.toFixed(2)}
                        </div>
                      </div>
                      <div className="neumorph p-1 rounded-lg text-center">
                        <div className="text-xs text-quantum-muted">Ratio</div>
                        <div className="text-xs font-medium">
                          {(engineAudioState.compressionMetrics.compressionRatio ? engineAudioState.compressionMetrics.compressionRatio * 100 : 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="neumorph p-4 rounded-xl">
                <div className="flex items-center mb-4">
                  <Radio className="h-5 w-5 text-quantum-accent mr-2" />
                  <h2 className="text-xl font-bold">Measurement</h2>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {engineAudioState && engineAudioState.quantumProbabilities ? 
                    Object.entries(engineAudioState.quantumProbabilities)
                      .slice(0, 4)
                      .map(([state, prob]) => (
                        <div 
                          key={state} 
                          className="neumorph p-2 rounded-lg flex flex-col items-center"
                        >
                          <div className="text-xs mb-1 font-mono">{state}</div>
                          <div className="text-sm font-medium text-quantum-accent">
                            {Math.floor(prob * 100)}%
                          </div>
                        </div>
                      ))
                    :
                    ["00", "01", "10", "11"].map((state) => (
                      <div 
                        key={state} 
                        className="neumorph p-2 rounded-lg flex flex-col items-center"
                      >
                        <div className="text-xs mb-1 font-mono">{state}</div>
                        <div className="text-sm font-medium text-quantum-accent">
                          {Math.floor(Math.random() * 40 + 10)}%
                        </div>
                      </div>
                    ))
                  }
                </div>
                
                {engineAudioState?.spectralAnalysis && (
                  <div className="mt-3">
                    <h3 className="text-xs font-medium mb-1">Spectral Analysis</h3>
                    <div className="neumorph p-2 rounded-lg">
                      <div className="h-8 relative">
                        {engineAudioState.spectralAnalysis.amplitudes.length > 0 && (
                          <div className="absolute inset-0 flex items-end">
                            {Array.from({ length: 32 }).map((_, i) => {
                              const idx = Math.floor(i * engineAudioState.spectralAnalysis!.amplitudes.length / 32);
                              const amp = engineAudioState.spectralAnalysis!.amplitudes[idx] || 0;
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
                    </div>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-center text-quantum-muted">
                  Quantum state probabilities
                </div>
              </div>
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
