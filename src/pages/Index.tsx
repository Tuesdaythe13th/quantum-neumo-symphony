import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { 
  Atom, Radio, Sliders, AudioWaveform, Play, 
  Volume2, Upload, Grid, Download, HelpCircle // Added HelpCircle
} from "lucide-react";

import Walkthrough from '@/components/Walkthrough'; // Added Walkthrough import
// import QuantumControls from "@/components/QuantumControls"; // Removed
import VisualAnalyzer from "@/components/VisualAnalyzer";
import QuantumPad from "@/components/QuantumPad";
import QuantumKnob from "@/components/QuantumKnob"; // Added
import QuantumSlider from "@/components/QuantumSlider"; // Added
import QuantumSwitch from "@/components/QuantumSwitch"; // Added
import WaveSelector from "@/components/WaveSelector"; // Added
import SpectralMappingSelector from "@/components/SpectralMappingSelector"; // Added
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Added for control grouping
import DAWTransport from "@/components/DAWTransport";
import QuantumAdvancedAudio from "@/components/QuantumAdvancedAudio";
import { toast } from "sonner";
import { quantumAudioEngine } from "@/lib/quantumAudioEngine";
import { AdvancedAudioSettings, defaultSettings as defaultAdvancedSettings } from "@/types/advancedAudioTypes";
import type { QuantumSettings, SpectralMode } from "@/components/QuantumControls"; // Import SpectralMode
import { QuantumAudioState } from "@/types/quantum";

// Default initial settings for QuantumControls, to be used in Index.tsx state
const initialQuantumSettings: QuantumSettings = {
  qubits: 4,
  shots: 1024,
  entanglement: 50,
  superposition: 75,
  gateType: "H", // Default gateType, can be made configurable if needed
  waveform: "sine",
  reverb: true,
  reverbMix: 30,
  chorus: false,
  stereo: true,
  quantumFilter: 60,
  qpixlIntegration: false,
  spectralMapping: "freq_qubits",
  temporalCoherence: 50,
  quantumHarmony: false,
  compressionThreshold: 30,
};

const Index = () => {
  const [showWalkthrough, setShowWalkthrough] = useState(false); // Added state for walkthrough
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [quantumSettings, setQuantumSettings] = useState<QuantumSettings>(initialQuantumSettings); // Initialize with full settings
  const [advancedAudioSettings, setAdvancedAudioSettings] = useState<AdvancedAudioSettings>(defaultAdvancedSettings);
  const [currentTime, setCurrentTime] = useState<string>("00:00");
  const [totalTime, setTotalTime] = useState<string>("00:00");
  const [audioState, setAudioState] = useState<QuantumAudioState | null>(null);
  const [visualizerType, setVisualizerType] = useState<"waveform" | "frequency" | "quantum" | "qpixl">("quantum");
  const [temporalCoherence, setTemporalCoherence] = useState<number>(50);
  // const [showAdvancedAudio, setShowAdvancedAudio] = useState<boolean>(false); // Step 2: Remove showAdvancedAudio state
  const [engineAudioState, setEngineAudioState] = useState<QuantumAudioState | null>(null);
  const [pythonOutput, setPythonOutput] = useState<{ qpixlStateArray: Float32Array | null, analysisDataFromPython: any | null }>({
    qpixlStateArray: null,
    analysisDataFromPython: null
  });
  
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSettingsRef = useRef<QuantumSettings | null>(null);
  const lastAdvancedSettingsRef = useRef<AdvancedAudioSettings | null>(null);
  const prevQpixlIntegrationRef = useRef<boolean | undefined>(undefined);

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

  // Simulate receiving data from a Python backend
  const mockPythonProcess = async () => {
    // Mock QPIXL data generation - in a real app, this would come from a Python backend
    const mockPixelCount = 256; // 16x16 grid
    const qpixlStateValues = new Array(mockPixelCount);
    
    // Generate mock quantum data
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

  // Add new function to update visualization only without full audio generation
  const updateVisualizationOnly = async () => {
    // No need for `if (!quantumSettings) return;` anymore as it's initialized
    try {
      // Generate QPIXL data immediately when controls change
      const quantumState = await quantumAudioEngine.generateQuantumSound(quantumSettings); // quantumSettings is now guaranteed to be non-null
      
      if (quantumState.qpixlData) {
        // Update python output with new QPIXL data
        setPythonOutput(prev => ({
          ...prev,
          qpixlStateArray: quantumState.qpixlData
        }));
        
        // Update visualizer mode
        if (quantumSettings.qpixlIntegration) {
          setVisualizerType("qpixl");
          setTemporalCoherence(quantumSettings.temporalCoherence);
        } else {
          setVisualizerType("quantum");
        }
      }
    } catch (error) {
      console.log("Visualization update failed, using mock data");
      // Fallback to mock data for visualization
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

  // Full generation pipeline combining Python and JS engines
  const triggerFullGenerationPipeline = async () => {
    // No need for `if (!quantumSettings)` check as it's initialized
    try {
      // Step 1: Get Python-processed QPIXL data
      const { qpixlStateValues, mockPythonAnalysis } = await mockPythonProcess();
      const qpixlStateArrayFromPython = new Float32Array(qpixlStateValues);
      setPythonOutput({ 
        qpixlStateArray: qpixlStateArrayFromPython, 
        analysisDataFromPython: mockPythonAnalysis 
      });
      
      // Step 2: Pass QPIXL data to quantum audio engine
      initAudio();
      quantumAudioEngine.setAdvancedAudioSettings(advancedAudioSettings);
      quantumAudioEngine.setQpixlData(qpixlStateArrayFromPython); // Set QPIXL data on engine
      
      // Step 3: Generate quantum audio
      const result = await quantumAudioEngine.generateQuantumSound(quantumSettings); // quantumSettings is non-null
      setEngineAudioState(result); // This includes qpixlDataForEngine
      
      if (quantumSettings.qpixlIntegration) { // quantumSettings is non-null
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

  const generateQuantumAudio = async () => {
    return triggerFullGenerationPipeline();
  };

  const handlePlay = async () => {
    initAudio(); // Step 4: Ensure initAudio is called

    let currentAudioStateForPlayback = audioState;

    // Step 2 & 3: Always generate new audio if audioState is invalid or if settings have changed significantly while stopped.
    // The existing useEffect for settings changes during playback handles that case.
    // For simplicity and robustness, if quantumSettings are present, we'll treat a play from stopped as needing fresh generation.
    // If audioState is null (e.g. first play or after stop), definitely regenerate.
    if (!currentAudioStateForPlayback || !currentAudioStateForPlayback.audioBuffer || !isPlaying) { // Added !isPlaying to force regen if stopped
      const generationResult = await generateQuantumAudio(); // This uses current settings and updates engineAudioState
      
      if (!generationResult || !generationResult.audioBuffer) {
        toast.error("Audio generation failed, cannot play.");
        return;
      }
      // Use the freshly generated audio for playback
      // generateQuantumAudio already sets engineAudioState. We can use that or update audioState directly.
      // For clarity, let's ensure audioState is explicitly set with the new result.
      setAudioState(generationResult); 
      currentAudioStateForPlayback = generationResult;
    }
    
    if (!currentAudioStateForPlayback || !currentAudioStateForPlayback.audioBuffer) {
      toast.error("No valid audio to play.");
      return;
    }

    // Play the generated audio
    quantumAudioEngine.play(currentAudioStateForPlayback.audioBuffer);
    setIsPlaying(true);
    
    // Start timer for tracking playback position
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    const startTime = audioContext?.currentTime || 0;
    const durationToPlay = currentAudioStateForPlayback.duration; // Use the duration of the state being played
    
    timerRef.current = window.setInterval(() => {
      if (!audioContext) return;
      
      const elapsed = audioContext.currentTime - startTime;
      if (elapsed >= durationToPlay) {
        // Instead of stopping, regenerate the audio for continuous play
        handleContinuousPlay(); // This function also calls generateQuantumAudio
        return;
      }
      
      const minutes = Math.floor(elapsed / 60);
      const seconds = Math.floor(elapsed % 60);
      setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 100);
    
    // Toast moved to generateQuantumAudio, but we can add a "Playback started" here if distinct
    // toast.success("Quantum synthesis started"); // Or "Playback started"
  };

  // New function for continuous playback
  const handleContinuousPlay = async () => {
    if (!isPlaying) { 
      setIsPlaying(false); 
      return;
    }
    // quantumSettings is guaranteed to be non-null here
    
    // Always generate new audio for continuous play based on current settings
    const generationResult = await generateQuantumAudio(); 
    
    if (generationResult && generationResult.audioBuffer) {
      setAudioState(generationResult); // Update audioState with the new generation
      quantumAudioEngine.play(generationResult.audioBuffer);
      
      // Reset timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      const startTime = audioContext?.currentTime || 0;
      const durationToPlay = generationResult.duration;

      timerRef.current = window.setInterval(() => {
        if (!audioContext) return;
        
        const elapsed = audioContext.currentTime - startTime;
        if (elapsed >= durationToPlay) {
          // Continue the loop
          handleContinuousPlay();
          return;
        }
        
        const minutes = Math.floor(elapsed / 60);
        const seconds = Math.floor(elapsed % 60);
        setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 100);
    } else {
      // If generation fails, stop playback
      setIsPlaying(false);
      toast.error("Failed to regenerate audio for continuous play.");
    }
  };

  const handleStop = () => {
    quantumAudioEngine.stop();
    setIsPlaying(false);
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Clear audioState on stop so that pressing play always regenerates.
    // setAudioState(null); // This makes it simple: play always regenerates if stopped.
    // Or, keep audioState and rely on the !isPlaying condition in handlePlay for regeneration.
    // For now, let's rely on !isPlaying in handlePlay and the settings change useEffect.
    
    setCurrentTime("00:00");
    toast.info("Synthesis stopped");
  };

  // Add new useEffect to update visualization on quantum settings change
  useEffect(() => {
    // quantumSettings is now initialized, so it's always an object.
    // Check if qpixlIntegration has changed
    if (prevQpixlIntegrationRef.current !== undefined && 
        quantumSettings.qpixlIntegration !== prevQpixlIntegrationRef.current) {
      if (quantumSettings.qpixlIntegration) {
        toast.info("QPIXL Integration Enabled! Select the 'QPIXL' visualizer type to see the effect.", {
          duration: 5000, // Keep the toast visible for a bit longer
        });
      } else {
        toast.info("QPIXL Integration Disabled.");
      }
    }
    
    // Update previous qpixlIntegration value
    prevQpixlIntegrationRef.current = quantumSettings.qpixlIntegration;
    
    // Store the current quantumSettings in lastSettingsRef for comparison in the next effect
    // This ensures that the settings comparison logic remains valid.
    // The visual update will also use the latest quantumSettings.
    lastSettingsRef.current = quantumSettings; 
    updateVisualizationOnly(); // This updates visualizer immediately!
    
  }, [quantumSettings]);

  // Effect to regenerate audio when settings change while playing
  useEffect(() => {
    const currentSettingsString = JSON.stringify(quantumSettings);
    const lastSettingsString = JSON.stringify(lastSettingsRef.current); // This ref is updated in the previous useEffect
    const currentAdvancedSettingsString = JSON.stringify(advancedAudioSettings);
    const lastAdvancedSettingsString = JSON.stringify(lastAdvancedSettingsRef.current);

    if (isPlaying && 
        (
          (currentSettingsString !== lastSettingsString) || 
          (currentAdvancedSettingsString !== lastAdvancedSettingsString)
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
    
    // After potential regeneration or if not playing, update the refs for the next render.
    // This was potentially missing: lastSettingsRef should always reflect the *processed* settings
    // However, the above useEffect for quantumSettings already updates lastSettingsRef.current = quantumSettings;
    // We need to ensure lastAdvancedSettingsRef is also kept up to date.
    if (currentAdvancedSettingsString !== lastAdvancedSettingsString) {
       lastAdvancedSettingsRef.current = advancedAudioSettings;
    }
    // lastSettingsRef is updated in the quantumSettings specific useEffect.

  }, [quantumSettings, advancedAudioSettings, isPlaying]);


  // Helper function to update quantumSettings, mimicking updateSettings from QuantumControls
  const handleQuantumSettingChange = <K extends keyof QuantumSettings>(
    key: K,
    value: QuantumSettings[K]
  ) => {
    setQuantumSettings(prev => ({ ...prev, [key]: value }));
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

  // Handle changes to advanced audio settings
  const handleAdvancedAudioChange = (settings: AdvancedAudioSettings) => {
    setAdvancedAudioSettings(settings);
    quantumAudioEngine.setAdvancedAudioSettings(settings);
  };

  // Toggle advanced audio panel
  // const toggleAdvancedAudio = () => { // Step 2: Remove toggleAdvancedAudio function
  //   setShowAdvancedAudio(!showAdvancedAudio);
  // };

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
      <div className="neumorph p-4 rounded-xl"> {/* Reduced padding for main container */}
        {/* Row 1: Transport Controls */}
        <div className="flex justify-between items-center mb-4 daw-transport-section"> {/* Reduced mb, ADDED .daw-transport-section */}
          <DAWTransport
            onPlay={handlePlay}
            onStop={handleStop}
            onSave={handleSave}
            onExport={handleExport}
            onSettings={handleSettings} // This might need a new home or to be a modal
            isPlaying={isPlaying}
            className="flex-grow"
          />
          <div className="flex gap-2"> {/* Group upload/download for compactness */}
            <button
              onClick={handleUpload}
              className="neumorph-button p-2.5 rounded-full" /* Reduced padding */
              title="Upload MIDI or Audio File"
            >
              <Upload className="h-4 w-4" /> {/* Reduced icon size */}
            </button>
            <button
              onClick={handleExport}
              className="neumorph-button p-2.5 rounded-full" /* Reduced padding */
              title="Export Audio"
            >
              <Download className="h-4 w-4" /> {/* Reduced icon size */}
            </button>
            {/* Walkthrough Trigger Button */}
            <button
              onClick={() => setShowWalkthrough(true)}
              className="neumorph-button p-2.5 rounded-full ml-2 text-purple-400 hover:text-purple-300"
              title="Show interface guide"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Main Content Grid (Visualizer, Controls, Analysis) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Column 1: Core Controls & Matrix (lg:col-span-1) */}
          <div className="lg:col-span-1 space-y-3">
            {/* Core Quantum Parameters */}
            <div className="neumorph p-3 rounded-xl quantum-knobs-section"> {/* ADDED .quantum-knobs-section */}
              <div className="flex items-center gap-2 mb-2">
                <Atom className="w-4 h-4 text-quantum-accent" />
                <h3 className="text-sm font-medium">Core Synthesis</h3>
              </div>
              <div className="space-y-3">
                <QuantumSlider label="Qubits" value={quantumSettings.qubits} min={2} max={8} step={1} onChange={(value) => handleQuantumSettingChange("qubits", value)} />
                <QuantumSlider label="Shots" value={quantumSettings.shots} min={256} max={4096} step={256} onChange={(value) => handleQuantumSettingChange("shots", value)} />
                <div className="grid grid-cols-3 gap-3">
                  <QuantumKnob label="Entanglement" value={quantumSettings.entanglement} min={0} max={100} onChange={(value) => handleQuantumSettingChange("entanglement", value)} />
                  <QuantumKnob label="Superposition" value={quantumSettings.superposition} min={0} max={100} onChange={(value) => handleQuantumSettingChange("superposition", value)} />
                  <QuantumKnob label="Q-Filter" value={quantumSettings.quantumFilter} min={0} max={100} onChange={(value) => handleQuantumSettingChange("quantumFilter", value)} />
                </div>
              </div>
            </div>

            {/* Waveform Selector */}
            <div className="neumorph p-3 rounded-xl">
               <WaveSelector value={quantumSettings.waveform} onChange={(value) => handleQuantumSettingChange("waveform", value as "sine" | "square" | "triangle" | "sawtooth" | "quantumNoise")} />
            </div>

            {/* Quantum Matrix (XY Pad) */}
            <div className="neumorph p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-4 h-4 text-quantum-accent" />
                <h3 className="text-sm font-medium">Quantum Matrix</h3>
              </div>
              <div className="h-48 neumorph rounded-lg flex items-center justify-center"> {/* Reduced height */}
                <QuantumPad xLabel="Decoherence" yLabel="Amplitude" onChange={handleQuantumPadChange} className="h-full w-full p-2" />
              </div>
            </div>
          </div>

          {/* Column 2: Visualizer & Output (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            {/* Quantum Visualizer (Prominent) */}
            <div className="neumorph p-3 rounded-xl h-[350px] lg:h-auto lg:flex-grow flex flex-col visual-analyzer-section"> {/* Increased height, flex-grow, ADDED .visual-analyzer-section */}
              <div className="flex items-center gap-2 mb-2">
                <AudioWaveform className="w-4 h-4 text-quantum-accent" />
                <h3 className="text-sm font-medium">Quantum Visualizer</h3>
              </div>
              <div className="flex-grow rounded-lg overflow-hidden min-h-[200px]"> {/* Ensure visualizer canvas can grow */}
                <VisualAnalyzer 
                  type={visualizerType}
                  color="#9b87f5"
                  audioContext={audioContext}
                  analyserNode={analyserNode}
                  qpixlData={pythonOutput.qpixlStateArray}
                  temporalCoherence={quantumSettings.temporalCoherence}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {[
                  { type: "waveform", label: "Waveform", icon: AudioWaveform },
                  { type: "frequency", label: "Spectrum", icon: Volume2 },
                  { type: "quantum", label: "Quantum", icon: Atom },
                  { type: "qpixl", label: "QPIXL", icon: Grid },
                ].map(item => (
                  <button key={item.type}
                    className={`${visualizerType === item.type ? 'neumorph-active' : 'neumorph-button'} flex items-center justify-center gap-1 text-xs p-1.5`}
                    onClick={() => setVisualizerType(item.type as any)}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-1.5 text-center">
                {(() => {
                  if (visualizerType === 'qpixl') {
                    if (pythonOutput.qpixlStateArray && pythonOutput.qpixlStateArray.length > 0) {
                      return <span className="text-xs font-medium text-green-400">Status: QPIXL Data Loaded</span>;
                    } else { return <span className="text-xs font-medium text-yellow-400">Status: QPIXL Active - No Data</span>; }
                  } else {
                    if (!quantumSettings.qpixlIntegration) { return <span className="text-xs font-medium text-gray-500">Status: QPIXL Integration Disabled</span>; }
                    return <span className="text-xs font-medium text-gray-500">Status: QPIXL Inactive</span>;
                  }
                })()}
              </div>
            </div>

            {/* Quantum Audio Output */}
            <div className="neumorph p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-4 h-4 text-quantum-accent" />
                <h3 className="text-sm font-medium">Audio Output</h3>
              </div>
              <div className="neumorph h-20 rounded-lg overflow-hidden mb-2"> {/* Reduced height */}
                <VisualAnalyzer type="waveform" color="#9b87f5" audioContext={audioContext} analyserNode={analyserNode} />
              </div>
              <div className="flex items-center justify-between">
                <button className={`${isPlaying ? "neumorph-active" : "neumorph"} p-2.5 rounded-full`} onClick={isPlaying ? handleStop : handlePlay}>
                  <Play className="h-4 w-4" />
                </button>
                <div className="flex-1 mx-3">
                  <div className="bg-quantum-light h-1 rounded-full overflow-hidden">
                    <div className="bg-quantum-accent h-full" style={{ width: engineAudioState && engineAudioState.duration > 0 ? `${(parseFloat(currentTime.split(':')[0]) * 60 + parseFloat(currentTime.split(':')[1])) / engineAudioState.duration * 100}%` : "0%" }}></div>
                  </div>
                </div>
                <div className="font-mono text-xs">{currentTime} / {totalTime}</div>
              </div>
            </div>
          </div>

          {/* Column 3: Advanced Controls & Analysis (lg:col-span-1) */}
          <div className="lg:col-span-1 space-y-3">
            <Accordion type="multiple" defaultValue={["qpixl-controls", "effects-controls"]} className="w-full">
              {/* QPIXL Controls */}
              <AccordionItem value="qpixl-controls" className="qpixl-toggle-section"> {/* ADDED .qpixl-toggle-section */}
                <AccordionTrigger className="text-sm font-medium p-3 hover:no-underline">QPIXL Settings</AccordionTrigger>
                <AccordionContent className="p-1 pt-0 space-y-3">
                  <div className="neumorph p-3 rounded-xl">
                    <QuantumSwitch label="QPIXL Integration" value={quantumSettings.qpixlIntegration} onChange={(value) => handleQuantumSettingChange("qpixlIntegration", value)} />
                  </div>
                  {quantumSettings.qpixlIntegration && (
                    <>
                      <div className="neumorph p-3 rounded-xl">
                        <QuantumSwitch label="Quantum Harmony" value={quantumSettings.quantumHarmony} onChange={(value) => handleQuantumSettingChange("quantumHarmony", value)} />
                      </div>
                      <div className="neumorph p-3 rounded-xl">
                        <SpectralMappingSelector value={quantumSettings.spectralMapping} onChange={(value) => handleQuantumSettingChange("spectralMapping", value as SpectralMode)} />
                      </div>
                      <div className="neumorph p-3 rounded-xl space-y-3">
                        <QuantumSlider label="Compression" value={quantumSettings.compressionThreshold} min={0} max={100} onChange={(value) => handleQuantumSettingChange("compressionThreshold", value)} unit="%" />
                        <QuantumSlider label="Temporal Coherence" value={quantumSettings.temporalCoherence} min={0} max={100} onChange={(value) => handleQuantumSettingChange("temporalCoherence", value)} unit="%" />
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Effects Controls */}
              <AccordionItem value="effects-controls">
                <AccordionTrigger className="text-sm font-medium p-3 hover:no-underline">Audio Effects</AccordionTrigger>
                <AccordionContent className="p-1 pt-0 space-y-3">
                  <div className="neumorph p-3 rounded-xl grid grid-cols-2 gap-3">
                     <QuantumSwitch label="Reverb" value={quantumSettings.reverb} onChange={(value) => handleQuantumSettingChange("reverb", value)} />
                     <QuantumSwitch label="Chorus" value={quantumSettings.chorus} onChange={(value) => handleQuantumSettingChange("chorus", value)} />
                     <QuantumSwitch label="Stereo" value={quantumSettings.stereo} onChange={(value) => handleQuantumSettingChange("stereo", value)} />
                  </div>
                  {quantumSettings.reverb && (
                    <div className="neumorph p-3 rounded-xl">
                      <QuantumSlider label="Reverb Mix" value={quantumSettings.reverbMix} min={0} max={100} onChange={(value) => handleQuantumSettingChange("reverbMix", value)} unit="%" />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Advanced Audio Synthesis (already accordionized internally) */}
              <AccordionItem value="advanced-audio" className="advanced-audio-accordion"> {/* ADDED .advanced-audio-accordion */}
                 <AccordionTrigger className="text-sm font-medium p-3 hover:no-underline">Advanced Synthesis</AccordionTrigger>
                 <AccordionContent className="p-1 pt-0">
                    <QuantumAdvancedAudio onChange={handleAdvancedAudioChange} initialSettings={advancedAudioSettings} />
                 </AccordionContent>
              </AccordionItem>
              
              {/* Analysis Panels */}
              <AccordionItem value="analysis-circuit">
                <AccordionTrigger className="text-sm font-medium p-3 hover:no-underline">Circuit Analysis</AccordionTrigger>
                <AccordionContent className="p-1 pt-0">
                  <div className="neumorph p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sliders className="w-4 h-4 text-quantum-accent" />
                      <h3 className="text-sm font-medium">Quantum Circuit</h3>
                    </div>
                    <div className="h-32 quantum-grid flex items-center justify-center rounded-lg text-xs"> {/* Reduced height */}
                      {engineAudioState?.circuitData ? (
                        <div className="text-center">
                          <div>Circuit: {engineAudioState.circuitData.qubits} qubits</div>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            {Object.entries(engineAudioState.circuitData.gates || {}).slice(0, 4).map(([idx, gate]: [string, any], i) => (
                              <div key={i} className="neumorph px-1.5 py-0.5 rounded text-xs"> {gate.type} @ q{gate.qubit || gate.target || 0}</div>
                            ))}
                          </div>
                        </div>
                      ) : ( <p className="text-quantum-muted"> {quantumSettings ? `Circuit: ${quantumSettings.qubits} qubits, ${quantumSettings.shots} shots` : "No circuit"} </p> )}
                    </div>
                    {engineAudioState?.compressionMetrics && (
                      <div className="mt-2">
                        <h3 className="text-xs font-medium mb-1">Compression</h3>
                        <div className="grid grid-cols-3 gap-1">
                          {[{label: "Original", value: engineAudioState.compressionMetrics.originalComplexity?.toFixed(1)},
                           {label: "Compressed", value: engineAudioState.compressionMetrics.compressedComplexity?.toFixed(1)},
                           {label: "Ratio", value: (engineAudioState.compressionMetrics.compressionRatio ? engineAudioState.compressionMetrics.compressionRatio * 100 : 0).toFixed(0) + "%"}
                          ].map(m => <div key={m.label} className="neumorph p-1.5 rounded text-center text-xs"><div className="text-quantum-muted text-[10px]">{m.label}</div><div>{m.value}</div></div>)}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="analysis-measurement">
                <AccordionTrigger className="text-sm font-medium p-3 hover:no-underline">Measurement Analysis</AccordionTrigger>
                <AccordionContent className="p-1 pt-0">
                   <div className="neumorph p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Radio className="w-4 h-4 text-quantum-accent" />
                      <h3 className="text-sm font-medium">Measurement</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(engineAudioState && engineAudioState.quantumProbabilities ? Object.entries(engineAudioState.quantumProbabilities).slice(0, 4) : [["00",0.45],["01",0.25],["10",0.20],["11",0.10]]).map(([state, prob]: [string, any]) => (
                        <div key={state} className="neumorph p-1.5 rounded flex flex-col items-center"><div className="font-mono">{state}</div><div className="text-quantum-accent">{(prob * 100).toFixed(0)}%</div></div>
                      ))}
                    </div>
                    {engineAudioState?.spectralAnalysis && (
                      <div className="mt-2">
                        <h3 className="text-xs font-medium mb-1">Spectral</h3>
                        <div className="neumorph p-2 rounded-lg h-16"> {/* Reduced height */}
                          {engineAudioState.spectralAnalysis.amplitudes.length > 0 && (
                            <div className="h-full flex items-end gap-px">
                              {Array.from({ length: 24 }).map((_, i) => {
                                const idx = Math.floor(i * engineAudioState.spectralAnalysis!.amplitudes.length / 24);
                                const amp = engineAudioState.spectralAnalysis!.amplitudes[idx] || 0;
                                return (<div key={i} className="flex-1 bg-quantum-accent" style={{ height: `${amp * 100}%` }} />);
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
      
            {/* Audio Output */}
            <div className="mt-4">
              <div className="neumorph h-32 rounded-xl overflow-hidden">
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
                        width: engineAudioState && engineAudioState.duration > 0 
                          ? `${(parseFloat(currentTime.split(':')[0]) * 60 + parseFloat(currentTime.split(':')[1])) / engineAudioState.duration * 100}%` 
                          : "0%" 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="font-mono text-sm">{currentTime} / {totalTime}</div>
              </div>
              
              {/* Volume Control */}
              <div className="flex items-center gap-2 mt-4">
                <Volume2 className="h-4 w-4" />
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
            
            {/* Effects and Processors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="neumorph p-4 rounded-xl">
                <div className="flex items-center mb-4">
                  <Sliders className="h-5 w-5 text-quantum-accent mr-2" />
                  <h2 className="text-xl font-bold">Quantum Circuit</h2>
                </div>
                
                <div className="h-40 quantum-grid flex items-center justify-center rounded-lg">
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
                
                {/* Compression Metrics Display */}
                {engineAudioState?.compressionMetrics && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Quantum Compression</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="neumorph p-2 rounded-lg text-center">
                        <div className="text-xs text-quantum-muted">Original</div>
                        <div className="text-sm font-medium">
                          {engineAudioState.compressionMetrics.originalComplexity?.toFixed(2)}
                        </div>
                      </div>
                      <div className="neumorph p-2 rounded-lg text-center">
                        <div className="text-xs text-quantum-muted">Compressed</div>
                        <div className="text-sm font-medium">
                          {engineAudioState.compressionMetrics.compressedComplexity?.toFixed(2)}
                        </div>
                      </div>
                      <div className="neumorph p-2 rounded-lg text-center">
                        <div className="text-xs text-quantum-muted">Ratio</div>
                        <div className="text-sm font-medium">
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
                  <h2 className="text-xl font-bold">Measurement Analysis</h2>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {engineAudioState && engineAudioState.quantumProbabilities ? 
                    Object.entries(engineAudioState.quantumProbabilities)
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
                {engineAudioState?.spectralAnalysis && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Spectral Analysis</h3>
                    <div className="neumorph p-3 rounded-lg">
                      <div className="h-12 relative">
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
                      
                      <div className="text-xs text-center mt-2 text-quantum-muted">
                        {engineAudioState.spectralAnalysis.harmonicRatios?.length > 0 && (
                          <span>Harmony ratio: {engineAudioState.spectralAnalysis.harmonicRatios[0].toFixed(2)}</span>
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
        </div>
      </div>
      
      <footer className="mt-8 text-center text-quantum-muted text-sm">
        <p>Quantum Music Synthesizer - Made with ❤️ and quantum superposition</p>
      </footer>

      {/* Render Walkthrough Component */}
      <Walkthrough 
        isOpen={showWalkthrough} 
        onClose={() => setShowWalkthrough(false)}
        position="top" 
      />
    </div>
  );
};

export default Index;
