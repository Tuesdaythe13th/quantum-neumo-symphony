
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import VisualAnalyzer from "./VisualAnalyzer";
import { AudioWaveform, Volume2, RotateCcw, Wifi, WifiOff } from "lucide-react";

interface QuantumStateData {
  amplitude: number;
  phase: number;
  frequency: number;
  entanglement: number;
  compression_ratio?: number;
  quantum_noise?: number;
  probabilities?: Record<string, number>;
  debug_message?: string;
}

interface QuantumSynestheticVizProps {
  className?: string;
  externalQuantumState?: QuantumStateData | null;
  wsPort?: number;
}

const DEFAULT_STATE: QuantumStateData = {
  amplitude: 0.5,
  phase: 0,
  frequency: 440,
  entanglement: 0.3,
  compression_ratio: 0.1,
  quantum_noise: 0.05,
  probabilities: {},
  debug_message: "Awaiting Python connection..."
};

const QuantumSynestheticViz: React.FC<QuantumSynestheticVizProps> = ({
  className,
  externalQuantumState,
  wsPort = 8765
}) => {
  // State to hold quantum visualization parameters
  const [currentState, setCurrentState] = useState<QuantumStateData>(DEFAULT_STATE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "error" | "disconnected">("connecting");
  
  // Audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoOscRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Process external state if provided
  useEffect(() => {
    if (externalQuantumState) {
      setCurrentState(externalQuantumState);
    }
  }, [externalQuantumState]);

  // Connect to WebSocket if wsPort is provided and no externalQuantumState
  useEffect(() => {
    if (externalQuantumState || !wsPort) return;

    setWsStatus("connecting");
    setCurrentState(prev => ({...prev, debug_message: `Connecting to ws://localhost:${wsPort}...`}));
    
    const socket = new WebSocket(`ws://localhost:${wsPort}`);
    wsRef.current = socket;
    
    socket.onopen = () => {
      setWsStatus("connected");
      console.log(`Connected to WebSocket server on port ${wsPort}`);
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'quantum_state_update' && message.data) {
          setCurrentState(message.data);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
    
    socket.onerror = (error) => {
      setWsStatus("error");
      setCurrentState(prev => ({...prev, debug_message: "WebSocket Error. Is Python server running?"}));
      console.error("WebSocket error:", error);
    };
    
    socket.onclose = () => {
      setWsStatus("disconnected");
      setCurrentState(prev => ({...prev, debug_message: "Disconnected from Python. Try restarting server."}));
      console.log("WebSocket connection closed");
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [externalQuantumState, wsPort]);

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      
      if (lfoOscRef.current) {
        lfoOscRef.current.stop();
        lfoOscRef.current.disconnect();
        lfoOscRef.current = null;
      }
    };
  }, []);

  // Audio generation based on quantum state
  useEffect(() => {
    if (!isPlaying || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    // Create oscillator if it doesn't exist
    if (!oscillatorRef.current) {
      oscillatorRef.current = ctx.createOscillator();
      gainNodeRef.current = ctx.createGain();
      oscillatorRef.current.connect(gainNodeRef.current!);
      gainNodeRef.current!.connect(ctx.destination);
      oscillatorRef.current.start();
    }
    
    // Create LFO for frequency modulation
    if (!lfoOscRef.current) {
      lfoOscRef.current = ctx.createOscillator();
      lfoGainRef.current = ctx.createGain();
      lfoOscRef.current.connect(lfoGainRef.current!);
      lfoGainRef.current!.connect(oscillatorRef.current.frequency);
      lfoOscRef.current.start();
    }
    
    // Set parameters from quantum state
    oscillatorRef.current.frequency.linearRampToValueAtTime(
      currentState.frequency * (1 + Math.sin(currentState.phase) * 0.05), 
      now + 0.1
    );
    
    gainNodeRef.current!.gain.linearRampToValueAtTime(
      currentState.amplitude * 0.2, // Scale down for comfortable volume
      now + 0.1
    );
    
    // LFO modulation based on entanglement
    lfoOscRef.current.frequency.linearRampToValueAtTime(
      currentState.entanglement * 8 + 0.5,
      now + 0.1
    );
    
    lfoGainRef.current!.gain.linearRampToValueAtTime(
      currentState.entanglement * currentState.frequency * 0.1,
      now + 0.1
    );
  }, [currentState, isPlaying]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      
      if (lfoOscRef.current) {
        lfoOscRef.current.stop();
        lfoOscRef.current = null;
      }
    };
  }, []);

  // Toggle audio playback
  const togglePlayback = () => {
    // Resume audio context if suspended (browser policy)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    setIsPlaying(prev => !prev);
  };

  // Reset to default state
  const resetState = () => {
    setCurrentState(DEFAULT_STATE);
  };

  // KEY CHANGE: Explicitly cast the visualizerType to the expected union type
  const hasQpixlData = currentState.probabilities && 
                      Object.keys(currentState.probabilities).length > 0;
  
  const visualizerType = hasQpixlData 
    ? "qpixl" as const
    : "quantum" as const;

  // Convert quantum state to visualization parameters
  const visualizerProps = {
    type: visualizerType,
    qpixlData: new Float32Array(
      Object.values(currentState.probabilities || {})
    ),
    temporalCoherence: currentState.entanglement * 100,
    color: `hsl(${(currentState.phase * 180 / Math.PI + 90) % 360}, 90%, 70%)`,
    backgroundColor: "transparent"
  };

  return (
    <div className={cn("relative h-full w-full bg-gradient-to-br from-gray-950 via-black to-purple-900/30", className)}>
      {/* Visualization area */}
      <div className="relative h-full w-full overflow-hidden">
        <VisualAnalyzer 
          {...visualizerProps}
          className="w-full h-full"
        />
        
        {/* Audio control button */}
        <button
          onClick={togglePlayback}
          className={cn(
            "absolute top-4 left-4 p-3 rounded-lg transition-all",
            isPlaying 
              ? "bg-pink-600 text-white shadow-lg" 
              : "bg-purple-600 hover:bg-purple-500 text-white"
          )}
          title={isPlaying ? "Pause Quantum Audio" : "Play Quantum Audio"}
        >
          {isPlaying ? <Volume2 size={20} /> : <AudioWaveform size={20} />}
        </button>
        
        {/* Reset state button */}
        <button
          onClick={resetState}
          className="absolute top-4 left-16 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all"
          title="Reset Visualization State"
        >
          <RotateCcw size={20} />
        </button>
        
        {/* Status indicator */}
        <div className="absolute bottom-4 left-4 p-2 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-mono shadow-lg max-w-xs">
          <div className={`flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-gray-700/50 ${
            wsStatus === "connected" ? "text-green-400" :
            wsStatus === "connecting" ? "text-yellow-400 animate-pulse" : "text-red-400"}`}>
            {wsStatus === "connected" && <Wifi size={14} />}
            {wsStatus === "connecting" && <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>}
            {(wsStatus === "disconnected" || wsStatus === "error") && <WifiOff size={14} />}
            <span>{wsStatus.charAt(0).toUpperCase() + wsStatus.slice(1)} {wsPort ? `(Port: ${wsPort})` : ''}</span>
          </div>
          <div className="text-purple-200/90 mb-1 truncate" title={currentState.debug_message}>
            {currentState.debug_message || "Status pending..."}
          </div>
          <div className="grid grid-cols-2 gap-x-3 text-[10px] text-gray-400">
            <div>Amp: {currentState.amplitude.toFixed(2)}</div>
            <div>Phase: {(currentState.phase / Math.PI).toFixed(2)}π</div>
            <div>Freq: {currentState.frequency.toFixed(0)} Hz</div>
            <div>Ent: {currentState.entanglement.toFixed(2)}</div>
            <div>Mode: {visualizerType}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumSynestheticViz;
