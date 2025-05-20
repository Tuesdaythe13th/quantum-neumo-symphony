import { QuantumSettings } from "@/components/QuantumControls";
import type { AdvancedAudioSettings } from "@/types/advancedAudioTypes";
import { QuantumAudioState, SpectralAnalysisData, CompressionMetricsData } from "@/types/quantum";

export class QuantumAudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private reverbNode: ConvolverNode | null = null;
  private chorusNode: DelayNode | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  private quantum_state: Record<string, number> = {};
  private qpixlData: Float32Array | null = null;
  private masterVolumeNode: GainNode | null = null;
  private advancedSettings: AdvancedAudioSettings | null = null;
  private musicalScales: Record<string, number[]> = {
    'Chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'Major Pentatonic': [0, 2, 4, 7, 9],
    'Minor Pentatonic': [0, 3, 5, 7, 10],
    'Blues': [0, 3, 5, 6, 7, 10],
    'Whole Tone': [0, 2, 4, 6, 8, 10],
  };

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      
      // Create master volume node
      this.masterVolumeNode = this.audioContext.createGain();
      this.masterVolumeNode.gain.value = 0.7; // Default master volume
      
      // Create audio graph
      this.gainNode.connect(this.masterVolumeNode);
      this.masterVolumeNode.connect(this.analyserNode);
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

  public getQPIXLData(): Float32Array | null {
    return this.qpixlData;
  }
  
  /**
   * Set external QPIXL data to be used for visualization and audio generation
   * @param data Float32Array containing QPIXL data or null to clear existing data
   */
  public setQpixlData(data: Float32Array | null): void {
    this.qpixlData = data;
  }

  public setAdvancedAudioSettings(settings: AdvancedAudioSettings): void {
    this.advancedSettings = settings;
    
    // Update master volume immediately
    if (this.masterVolumeNode && settings.masterVolume !== undefined) {
      this.masterVolumeNode.gain.value = settings.masterVolume;
    }
  }

  public getAdvancedAudioSettings(): AdvancedAudioSettings | null {
    return this.advancedSettings;
  }

  // Helper function to convert MIDI note to frequency
  private midiToFreq(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  // Helper for musical scale mapping
  private mapQPIXLToNote(qpixlValue: number, scaleType: string, rootNote: number, octaveRange: number): number {
    // Handle microtonal scales
    if (scaleType.includes('Microtonal')) {
      if (scaleType === 'Microtonal QPIXL (Octave Segmented)') {
        // Map 0-1 to 0-12 semitones within a single octave, then repeat for multiple octaves
        const fractionalPart = qpixlValue - Math.floor(qpixlValue);
        const semitones = fractionalPart * 12;
        return this.midiToFreq(rootNote + semitones);
      } else {
        // Map 0-1 to a wider continuous frequency range across multiple octaves
        const octaveShift = (qpixlValue * octaveRange) - (octaveRange / 2);
        return this.midiToFreq(rootNote) * Math.pow(2, octaveShift);
      }
    }
    
    // Handle standard scales
    const scale = this.musicalScales[scaleType] || this.musicalScales['Chromatic'];
    const scaleLength = scale.length;
    const scaleIndex = Math.min(Math.floor(qpixlValue * scaleLength), scaleLength - 1);
    const octaveOffset = Math.floor(qpixlValue * 3) - 1; // -1 to +1 octaves
    return this.midiToFreq(rootNote + scale[scaleIndex] + (octaveOffset * 12));
  }

  private getQPIXLValue(qpixlArray: Float32Array | null, method: string, index = 0): number {
    if (!qpixlArray || qpixlArray.length === 0) return 0.5;
    
    switch(method) {
      case 'First QPIXL Value':
        return qpixlArray[0] || 0.5;
      case 'Average QPIXL Value':
        return qpixlArray.reduce((sum, val) => sum + val, 0) / qpixlArray.length;
      case 'Random QPIXL Value':
        return qpixlArray[Math.floor(Math.random() * qpixlArray.length)] || 0.5;
      default:
        // Use specific index
        return qpixlArray[index % qpixlArray.length] || 0.5;
    }
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
    
    // Generate QPIXL data if enabled and not already provided externally
    let spectralAnalysis = null;
    let compressionMetrics = null;
    
    if (settings.qpixlIntegration) {
      // Only generate QPIXL data if not already provided externally
      if (!this.qpixlData) {
        // Generate quantum-pixel mapping
        const pixelDimensions = Math.pow(2, Math.min(4, settings.qubits - 2)); // Keep reasonable size
        this.qpixlData = this.generateQPIXLData(
          pixelDimensions, 
          settings.spectralMapping, 
          settings.temporalCoherence / 100
        );
      }
      
      // If we're using QPIXL for audio generation, use it to modulate the audio
      if (settings.spectralMapping === "qpixl_bi") {
        spectralAnalysis = this.performSpectralAnalysis(duration, sampleRate);
        compressionMetrics = this.calculateCompressionMetrics(settings.compressionThreshold / 100);
      }
    }

    // Use advanced audio settings if available
    const useAdvancedSettings = this.advancedSettings !== null;
    
    // Generate audio data based on quantum parameters and advanced settings
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      // Apply quantum state to the audio waveform
      for (let i = 0; i < channelData.length; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // Base frequency modulated by quantum parameters or musical scale
        let baseFreq = 220 + (settings.superposition * 2);
        
        // Apply musical scale mapping if enabled
        if (useAdvancedSettings && this.advancedSettings?.enableMusicalScale) {
          const qpixlValue = this.getQPIXLValue(
            this.qpixlData, 
            this.advancedSettings.qpixlNoteSelectionMethod,
            i % (this.qpixlData?.length || 1)
          );
          
          baseFreq = this.mapQPIXLToNote(
            qpixlValue,
            this.advancedSettings.scaleType,
            this.advancedSettings.rootNote,
            this.advancedSettings.microtonalOctaveRange
          );
        }
        
        // Apply additive synthesis if enabled
        if (useAdvancedSettings && this.advancedSettings?.enableAdditive) {
          const numPartials = this.advancedSettings.numPartials;
          const harmonicControlMapping = this.advancedSettings.harmonicControlMapping;
          const harmonicSpreadFactor = this.advancedSettings.harmonicSpreadFactor;
          const harmonicProfile = this.advancedSettings.harmonicAmplitudeProfile;
          
          for (let h = 1; h <= numPartials; h++) {
            // Pick a QPIXL value for this harmonic
            const qpixlIndex = (i * h) % (this.qpixlData?.length || 1);
            const qpx = this.qpixlData && this.qpixlData.length > 0 
              ? this.qpixlData[qpixlIndex] 
              : 0.5;
            
            let partialFreq = baseFreq * h;
            let partialAmp = 0;
            let partialPhase = 0;
            
            // Determine base amplitude based on profile
            switch (harmonicProfile) {
              case '1/h':
                partialAmp = 1 / h;
                break;
              case 'Flat':
                partialAmp = 1 / numPartials;
                break;
              case '1/h^2':
                partialAmp = 1 / (h * h);
                break;
              case 'QPIXL-Shaped':
                partialAmp = qpx / numPartials;
                break;
              default:
                partialAmp = 1 / h; // Default to natural
            }
            
            // Apply QPIXL data based on selected mapping
            switch (harmonicControlMapping) {
              case 'Amplitudes':
                partialAmp *= (0.5 + 0.5 * qpx);
                break;
              case 'Frequencies':
                partialFreq *= (1 + (qpx - 0.5) * harmonicSpreadFactor * h);
                break;
              case 'Phases':
                partialPhase = qpx * Math.PI * 2;
                break;
            }
            
            sample += Math.sin(2 * Math.PI * partialFreq * time + partialPhase) * partialAmp;
          }
          
          if (numPartials > 0) {
            sample /= Math.sqrt(numPartials); // Normalization for additive synthesis
          }
        } else {
          // Standard waveform generation if additive synthesis is disabled
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
          
          // Apply QPIXL modulation if enabled
          if (settings.qpixlIntegration && this.qpixlData) {
            const pixelIndex = Math.floor((i / channelData.length) * this.qpixlData.length) % this.qpixlData.length;
            const qpixlFactor = settings.temporalCoherence / 100;
            
            // Apply different modulation based on spectral mapping mode
            switch (settings.spectralMapping) {
              case "freq_qubits":
                // Frequency modulation
                const freqMod = 1 + (this.qpixlData[pixelIndex] - 0.5) * qpixlFactor;
                sample = Math.sin(2 * Math.PI * baseFreq * time * freqMod);
                break;
              case "amp_phase":
                // Amplitude and phase modulation
                const phase = this.qpixlData[pixelIndex] * Math.PI * 2;
                sample = sample * (0.5 + this.qpixlData[pixelIndex] * 0.5) + 
                        Math.sin(2 * Math.PI * baseFreq * 1.5 * time + phase) * 0.3;
                break;
              case "harm_ent":
                // Harmonic entanglement
                const harmIndex = (pixelIndex + 1) % this.qpixlData.length;
                const harmFactor = this.qpixlData[harmIndex];
                sample = sample * 0.7 + 
                        Math.sin(2 * Math.PI * baseFreq * 2 * time) * 0.3 * harmFactor;
                break;
              case "qpixl_bi":
                // Full bidirectional mapping
                sample = this.qpixlData[pixelIndex] * 2 - 1;
                
                // Apply quantum harmony if enabled
                if (settings.quantumHarmony) {
                  const harmonicIndexes = [
                    pixelIndex,
                    (pixelIndex + this.qpixlData.length / 3) % this.qpixlData.length,
                    (pixelIndex + this.qpixlData.length * 2 / 3) % this.qpixlData.length
                  ];
                  
                  sample = harmonicIndexes.reduce((acc, idx) => {
                    return acc + (this.qpixlData![idx] * 2 - 1);
                  }, 0) / harmonicIndexes.length;
                }
                
                // Apply compression if needed
                if (settings.compressionThreshold > 0) {
                  const threshold = settings.compressionThreshold / 100;
                  sample = Math.tanh(sample * (1 + threshold * 2));
                }
                break;
            }
          }
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
        let finalSample = filteredSample;
        if (channel === 1 && settings.stereo && settings.entanglement > 0) {
          const leftChannel = buffer.getChannelData(0);
          if (i > 0) {
            const entanglementFactor = settings.entanglement / 200;
            finalSample = filteredSample * (1 - entanglementFactor) + leftChannel[i-1] * entanglementFactor;
          }
        }
        
        channelData[i] = finalSample * envelope * 0.5; // Reduce volume to avoid clipping
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
      circuitData,
      qpixlData: this.qpixlData,
      qpixlDataForEngine: this.qpixlData, // Add this so the engine output includes qpixlData for visualization
      spectralAnalysis,
      compressionMetrics
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

  private generateQPIXLData(pixelDimensions: number, mappingMode: string, temporalCoherence: number): Float32Array {
    // Generate a quantum-pixel mapping based on the quantum state
    const pixelCount = pixelDimensions * pixelDimensions;
    const qpixlData = new Float32Array(pixelCount);
    
    // Seed based on current quantum state
    const quantumSeed = Object.entries(this.quantum_state).reduce(
      (acc, [state, prob]) => acc + parseInt(state, 2) * prob, 0
    );
    
    // Generate pixel data based on quantum interference patterns
    for (let i = 0; i < pixelCount; i++) {
      const x = i % pixelDimensions / pixelDimensions;
      const y = Math.floor(i / pixelDimensions) / pixelDimensions;
      
      // Use quantum seed to create deterministic but quantum-like patterns
      const quantumPhase = quantumSeed * 10;
      
      // Create interference patterns based on mapping mode
      switch (mappingMode) {
        case "freq_qubits":
          // Frequency-based patterns
          qpixlData[i] = (
            Math.sin(x * 5 + y * 7 + quantumPhase) * 0.5 + 
            Math.sin(x * 13 + y * 17 + quantumPhase * 1.5) * 0.3 +
            Math.sin(x * 29 + y * 31 + quantumPhase * 0.7) * 0.2
          ) * 0.5 + 0.5;
          break;
        
        case "amp_phase":
          // Amplitude and phase patterns
          qpixlData[i] = (
            Math.sin(x * 2 * Math.PI + quantumPhase) * 
            Math.cos(y * 2 * Math.PI + quantumPhase)
          ) * 0.5 + 0.5;
          break;
        
        case "harm_ent":
          // Harmonic entanglement patterns
          const distance = Math.sqrt(
            Math.pow((x - 0.5) * 2, 2) + 
            Math.pow((y - 0.5) * 2, 2)
          );
          qpixlData[i] = (
            Math.cos(distance * 10 + quantumPhase) * 
            Math.sin(x * y * 20 + quantumPhase)
          ) * 0.5 + 0.5;
          break;
        
        case "qpixl_bi":
          // Bidirectional mapping - more complex patterns
          const angle = Math.atan2(y - 0.5, x - 0.5);
          const radiusVar = 0.5 + temporalCoherence * 0.5;
          qpixlData[i] = (
            Math.sin(distance * 15 * radiusVar + quantumPhase) * 0.3 +
            Math.sin(angle * 5 + quantumPhase) * 0.3 +
            Math.sin((x * x + y * y) * 20 + quantumPhase) * 0.4
          ) * 0.5 + 0.5;
          break;
          
        default:
          // Default simple pattern
          qpixlData[i] = (
            Math.sin(x * 10 + quantumPhase) * 
            Math.cos(y * 10 + quantumPhase)
          ) * 0.5 + 0.5;
      }
    }
    
    return qpixlData;
  }
  
  private performSpectralAnalysis(duration: number, sampleRate: number) {
    // Perform spectral analysis on the generated quantum data
    if (!this.qpixlData) return null;
    
    // Create a simulated frequency spectrum based on qpixlData
    const frequencies = new Float32Array(128);
    const amplitudes = new Float32Array(128);
    const harmonicRatios = [];
    
    // Extract frequency and amplitude information from QPIXL data
    for (let i = 0; i < frequencies.length; i++) {
      const normalizedFreq = i / frequencies.length;
      
      // Sample QPIXL data for this frequency bin
      const pixelIndex = Math.floor(normalizedFreq * this.qpixlData.length);
      
      // Set frequency and amplitude
      frequencies[i] = 440 * Math.pow(2, (normalizedFreq * 2 - 1));
      amplitudes[i] = this.qpixlData[pixelIndex % this.qpixlData.length];
      
      // Calculate harmonic ratios for some frequencies
      if (i % 12 === 0) {
        const harmonicIndex = (pixelIndex + this.qpixlData.length / 3) % this.qpixlData.length;
        const harmonicStrength = this.qpixlData[harmonicIndex];
        harmonicRatios.push(harmonicStrength / amplitudes[i]);
      }
    }
    
    return {
      frequencies,
      amplitudes,
      harmonicRatios
    };
  }
  
  private calculateCompressionMetrics(compressionThreshold: number) {
    // Calculate compression metrics for the QPIXL data
    if (!this.qpixlData) return null;
    
    // Simple complexity metric - entropy-like measure
    const originalComplexity = this.qpixlData.reduce((acc, val) => {
      const p = Math.max(0.001, Math.min(0.999, val)); // Avoid log(0)
      return acc - (p * Math.log2(p) + (1-p) * Math.log2(1-p));
    }, 0) / this.qpixlData.length;
    
    // Apply compression (simple quantization)
    const levels = Math.max(2, Math.floor(16 * (1 - compressionThreshold)));
    const compressedValues = new Float32Array(this.qpixlData.length);
    
    for (let i = 0; i < this.qpixlData.length; i++) {
      // Quantize to fewer levels
      const quantized = Math.floor(this.qpixlData[i] * levels) / levels;
      compressedValues[i] = quantized;
    }
    
    // Calculate compressed complexity
    const compressedComplexity = compressedValues.reduce((acc, val) => {
      const p = Math.max(0.001, Math.min(0.999, val));
      return acc - (p * Math.log2(p) + (1-p) * Math.log2(1-p));
    }, 0) / compressedValues.length;
    
    const compressionRatio = originalComplexity > 0 ? 
      compressedComplexity / originalComplexity : 1;
    
    return {
      originalComplexity,
      compressedComplexity,
      compressionRatio
    };
  }

  public play(buffer: AudioBuffer, seamless: boolean = false): void {
    if (!this.audioContext) return;
    
    // Resume audio context if suspended (browser policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Create and configure source
    const newSource = this.audioContext.createBufferSource();
    newSource.buffer = buffer;
    
    if (seamless && this.audioSource) {
      // For seamless transition, we don't stop the current source immediately
      // but fade between them
      
      // Create a gain node for the old source
      const oldGain = this.audioContext.createGain();
      this.audioSource.disconnect();
      this.audioSource.connect(oldGain);
      oldGain.connect(this.gainNode!);
      
      // Create a gain node for the new source
      const newGain = this.audioContext.createGain();
      newSource.connect(newGain);
      newGain.connect(this.gainNode!);
      
      // Cross-fade
      const fadeTime = 0.1; // 100ms crossfade
      const now = this.audioContext.currentTime;
      
      // Fade out old source
      oldGain.gain.setValueAtTime(1, now);
      oldGain.gain.linearRampToValueAtTime(0, now + fadeTime);
      
      // Fade in new source
      newGain.gain.setValueAtTime(0, now);
      newGain.gain.linearRampToValueAtTime(1, now + fadeTime);
      
      // Schedule cleanup of old source
      setTimeout(() => {
        try {
          this.audioSource?.stop();
        } catch (e) {
          // Ignore errors if already stopped
        }
      }, fadeTime * 1000 + 10);
    } else {
      // Stop current audio if any
      this.stop();
      
      // Connect new source
      newSource.connect(this.gainNode!);
    }
    
    // Start playback
    newSource.start();
    this.audioSource = newSource;
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
