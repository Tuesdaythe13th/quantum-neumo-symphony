
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import VisualAnalyzer from "./VisualAnalyzer";
import { AudioWaveform, Volume2 } from "lucide-react";

interface QuantumStateData {
  amplitude: number;
  phase: number;
  frequency: number;
  entanglement: number;
  compression_ratio: number;
  quantum_noise: number;
  probabilities: Record<string, number>;
  debug_message: string;
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
  debug_message: "Initializing..."
};

const QuantumSynestheticViz: React.FC<QuantumSynestheticVizProps> = ({
  className,
  externalQuantumState,
  wsPort = 8765
}) => {
  // State to hold quantum visualization parameters
  const [currentState, setCurrentState] = useState<QuantumStateData>(DEFAULT_STATE);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoOscRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  
  // Process external state if provided
  useEffect(() => {
    if (externalQuantumState) {
      setCurrentState(externalQuantumState);
    }
  }, [externalQuantumState]);

  // Connect to WebSocket if wsPort is provided and no externalQuantumState
  useEffect(() => {
    // Only attempt WebSocket connection if no external state is provided
    // and wsPort is valid
    if (externalQuantumState || !wsPort) return;

    const socket = new WebSocket(`ws://localhost:${wsPort}`);
    
    socket.onopen = () => {
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
      console.error("WebSocket error:", error);
    };
    
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    
    return () => {
      socket.close();
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
      currentState.frequency, 
      now + 0.1
    );
    
    gainNodeRef.current!.gain.linearRampToValueAtTime(
      currentState.amplitude * 0.2, // Scale down for comfortable volume
      now + 0.1
    );
    
    // LFO modulation based on entanglement
    lfoOscRef.current.frequency.linearRampToValueAtTime(
      currentState.entanglement * 10 + 0.2,
      now + 0.1
    );
    
    lfoGainRef.current!.gain.linearRampToValueAtTime(
      currentState.entanglement * currentState.frequency * 0.4,
      now + 0.1
    );

    return () => {
      // Cleanup handled by the main audio effect
    };
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

  // Convert quantum state to visualization parameters
  const visualizerProps = {
    type: "quantum" as const,
    qpixlData: new Float32Array(
      Object.values(currentState.probabilities || {})
    ),
    temporalCoherence: currentState.entanglement * 100
  };

  return (
    <div className={cn("relative h-full w-full bg-quantum-bg", className)}>
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
            "absolute top-4 left-4 p-3 rounded-full transition-all duration-200",
            isPlaying 
              ? "neumorph-active text-quantum-glow" 
              : "neumorph text-white hover:shadow-neumorph-glow"
          )}
        >
          {isPlaying ? <Volume2 size={20} /> : <AudioWaveform size={20} />}
        </button>
        
        {/* Status indicator */}
        <div className="absolute bottom-4 left-4 p-2 neumorph text-xs font-mono">
          <div className="text-quantum-accent">
            {currentState.debug_message || "Ready"}
          </div>
          <div className="grid grid-cols-2 gap-x-4 text-[10px] text-white/70">
            <div>Amp: {currentState.amplitude.toFixed(2)}</div>
            <div>Phase: {(currentState.phase / Math.PI).toFixed(2)}π</div>
            <div>Freq: {currentState.frequency.toFixed(0)} Hz</div>
            <div>Ent: {currentState.entanglement.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumSynestheticViz;
