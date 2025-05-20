
export interface SpectralAnalysisData { 
  frequencies: Float32Array; 
  amplitudes: Float32Array; 
  harmonicRatios?: number[]; 
}

export interface CompressionMetricsData { 
  originalComplexity?: number; 
  compressedComplexity?: number; 
  compressionRatio?: number; 
}

export interface QuantumCircuitInfo { 
  qubits?: number;
  depth?: number; 
  gates?: any[];
  measurements?: Record<string, number>;
}

export interface QuantumAudioState {
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  quantumProbabilities: Record<string, number>;
  circuitData: any;
  qpixlData?: Float32Array | null;
  spectralAnalysis?: SpectralAnalysisData | null;
  compressionMetrics?: CompressionMetricsData | null;
}
