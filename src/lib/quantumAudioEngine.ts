
import { QuantumSettings } from "@/components/QuantumControls";

export interface QuantumAudioState {
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  quantumProbabilities: Record<string, number>;
  circuitData: any;
}

export class QuantumAudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private reverbNode: ConvolverNode | null = null;
  private chorusNode: DelayNode | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  private quantum_state: Record<string, number> = {};

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      
      // Create audio graph
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);

      // Create impulse response for reverb
      this.createReverbImpulseResponse();
    } catch (error) {
      console.error("Failed to initialize audio engine:", error);
    }
  }

  private async createReverbImpulseResponse() {
    if (!this.audioContext) return;
    
    try {
      // Create impulse response for reverb (simulated)
      const sampleRate = this.audioContext.sampleRate;
      const length = 2 * sampleRate; // 2 seconds reverb
      const impulseResponse = this.audioContext.createBuffer(2, length, sampleRate);
      
      // Create decay curve for reverb
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulseResponse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }
      
      this.reverbNode = this.audioContext.createConvolver();
      this.reverbNode.buffer = impulseResponse;
    } catch (error) {
      console.error("Failed to create reverb:", error);
    }
  }

  private setupChorusEffect() {
    if (!this.audioContext) return;
    
    // Simple chorus implementation
    this.chorusNode = this.audioContext.createDelay();
    this.chorusNode.delayTime.value = 0.03; // 30ms delay
  }

  private connectEffectsChain(settings: QuantumSettings) {
    if (!this.audioContext || !this.gainNode || !this.analyserNode) return;

    // Reset connections
    this.gainNode.disconnect();
    
    // Build effects chain based on settings
    let currentNode: AudioNode = this.gainNode;
    
    if (settings.reverb && this.reverbNode) {
      currentNode.connect(this.reverbNode);
      currentNode = this.reverbNode;
      
      // Apply reverb mix (simplified)
      this.gainNode.gain.value = settings.reverbMix / 100;
    }
    
    if (settings.chorus && !this.chorusNode) {
      this.setupChorusEffect();
    }
    
    if (settings.chorus && this.chorusNode) {
      currentNode.connect(this.chorusNode);
      currentNode = this.chorusNode;
    }
    
    // Connect final node to analyzer then destination
    currentNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  public async generateQuantumSound(settings: QuantumSettings): Promise<QuantumAudioState> {
    if (!this.audioContext) {
      throw new Error("Audio context not initialized");
    }

    // Stop any currently playing audio
    this.stop();
    
    // Connect effects based on settings
    this.connectEffectsChain(settings);
    
    // Generate quantum state based on settings
    this.quantum_state = this.calculateQuantumProbabilities(settings);
    
    // Create frequencies based on quantum state
    const duration = 4; // 4 seconds of audio
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(
      settings.stereo ? 2 : 1,
      duration * sampleRate,
      sampleRate
    );
    
    // Generate audio data based on quantum parameters
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      // Apply quantum state to the audio waveform
      for (let i = 0; i < channelData.length; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // Base frequency modulated by quantum parameters
        const baseFreq = 220 + (settings.superposition * 2);
        
        // Waveform selection
        switch (settings.waveform) {
          case "sine":
            sample = Math.sin(2 * Math.PI * baseFreq * time);
            break;
          case "square":
            sample = Math.sign(Math.sin(2 * Math.PI * baseFreq * time));
            break;
          case "triangle":
            sample = 2 * Math.abs(2 * (time * baseFreq - Math.floor(time * baseFreq + 0.5))) - 1;
            break;
          case "sawtooth":
            sample = 2 * (time * baseFreq - Math.floor(time * baseFreq));
            break;
          case "quantumNoise":
            // Quantum noise modulated by superposition and entanglement
            const qFactor = settings.superposition / 100;
            const eFactor = settings.entanglement / 100;
            const noise = Math.random() * 2 - 1;
            const quantumSine = Math.sin(2 * Math.PI * baseFreq * time);
            sample = (quantumSine * (1 - qFactor)) + (noise * qFactor * eFactor);
            break;
        }
        
        // Apply envelope
        const attack = 0.1;
        const release = 0.3;
        let envelope = 1;
        
        // Simple ADSR envelope
        if (time < attack) {
          envelope = time / attack;
        } else if (time > duration - release) {
          envelope = (duration - time) / release;
        }
        
        // Apply quantum filter based on settings
        const filterFactor = settings.quantumFilter / 100;
        const filteredSample = this.applyQuantumFilter(sample, filterFactor, i);
        
        // Apply entanglement effect (slight modulation from one channel to the other)
        if (channel === 1 && settings.stereo && settings.entanglement > 0) {
          const leftChannel = buffer.getChannelData(0);
          if (i > 0) {
            const entanglementFactor = settings.entanglement / 200;
            filteredSample = filteredSample * (1 - entanglementFactor) + leftChannel[i-1] * entanglementFactor;
          }
        }
        
        channelData[i] = filteredSample * envelope * 0.5; // Reduce volume to avoid clipping
      }
    }
    
    // Generate circuit data for visualization
    const circuitData = this.generateCircuitData(settings);
    
    return {
      audioBuffer: buffer,
      isPlaying: false,
      currentTime: 0,
      duration: buffer.duration,
      quantumProbabilities: this.quantum_state,
      circuitData
    };
  }
  
  private applyQuantumFilter(sample: number, filterAmount: number, sampleIndex: number): number {
    // Simple low-pass filter that gets stronger with higher filterAmount
    if (filterAmount === 0) return sample;
    
    // Use a simple IIR filter idea here
    const prevSample = this.oscillators.length > 0 ? 
      (this.oscillators[0] as any).prevSample || 0 : 0;
    
    const filteredSample = sample * (1 - filterAmount) + prevSample * filterAmount;
    
    if (this.oscillators.length > 0) {
      (this.oscillators[0] as any).prevSample = filteredSample;
    }
    
    return filteredSample;
  }

  private calculateQuantumProbabilities(settings: QuantumSettings): Record<string, number> {
    // Simulate quantum probabilities based on settings
    const qubits = settings.qubits;
    const entanglement = settings.entanglement / 100;
    const superposition = settings.superposition / 100;
    
    const states: Record<string, number> = {};
    const stateCount = Math.pow(2, qubits);
    
    // Generate basic probabilities
    for (let i = 0; i < stateCount; i++) {
      // Convert to binary representation
      const stateStr = i.toString(2).padStart(qubits, '0');
      
      // Calculate probability - simulation of quantum behavior
      // This is a simplified model that creates an interesting distribution
      let prob = 1 / stateCount; // Equal superposition base
      
      // Add influence from superposition parameter
      // Higher superposition leads to more equal probabilities
      if (superposition < 1) {
        const favorMiddleStates = Math.abs(i - stateCount / 2) / (stateCount / 2);
        prob = prob * (1 - superposition) + 
               (1 / stateCount) * superposition * (1 - favorMiddleStates);
      }
      
      // Add influence from entanglement
      // Higher entanglement causes certain states to be correlated
      if (entanglement > 0 && qubits >= 2) {
        const firstBit = stateStr[0];
        const lastBit = stateStr[qubits - 1];
        
        // In high entanglement, first and last qubits tend to match
        if (firstBit === lastBit) {
          prob = prob * (1 + entanglement * 0.5);
        } else {
          prob = prob * (1 - entanglement * 0.5);
        }
      }
      
      states[stateStr] = prob;
    }
    
    // Normalize probabilities
    const sum = Object.values(states).reduce((a, b) => a + b, 0);
    Object.keys(states).forEach(key => {
      states[key] = states[key] / sum;
    });
    
    return states;
  }

  private generateCircuitData(settings: QuantumSettings) {
    // Create a simple representation of a quantum circuit
    const qubits = settings.qubits;
    const gates = [];
    
    // Create a circuit design based on settings
    for (let i = 0; i < qubits; i++) {
      const qubitGates = [];
      
      // Add Hadamard gates at the start to create superposition
      qubitGates.push({
        type: 'H',
        position: 0,
        qubit: i
      });
      
      // Add different gates based on settings
      if (settings.entanglement > 0 && i < qubits - 1) {
        // Add entanglement gates (CNOT) between qubits
        qubitGates.push({
          type: 'CNOT',
          position: 1,
          control: i,
          target: i + 1
        });
      }
      
      // Add rotation gates based on superposition
      if (settings.superposition > 0) {
        const rotationAmount = settings.superposition / 100 * Math.PI;
        qubitGates.push({
          type: 'RY',
          position: 2,
          qubit: i,
          angle: rotationAmount
        });
      }
      
      gates.push(qubitGates);
    }
    
    return {
      qubits,
      depth: 3, // Maximum circuit depth
      gates: gates.flat(),
      measurements: this.quantum_state
    };
  }

  public play(buffer: AudioBuffer): void {
    if (!this.audioContext) return;
    
    // Resume audio context if suspended (browser policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Create and configure source
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = buffer;
    this.audioSource.connect(this.gainNode!);
    
    // Start playback
    this.audioSource.start();
  }

  public stop(): void {
    if (this.audioSource) {
      try {
        this.audioSource.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      this.audioSource = null;
    }
  }

  public getQuantumState(): Record<string, number> {
    return this.quantum_state;
  }
}

// Create a singleton instance
export const quantumAudioEngine = new QuantumAudioEngine();
