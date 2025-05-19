import { useEffect, useRef } from "react";

interface VisualAnalyzerProps {
  audioContext?: AudioContext | null;
  analyserNode?: AnalyserNode | null;
  type?: "waveform" | "frequency" | "quantum" | "qpixl";
  color?: string;
  backgroundColor?: string;
  className?: string;
  qpixlData?: Float32Array | null;
  temporalCoherence?: number;
}

const VisualAnalyzer = ({
  audioContext,
  analyserNode,
  type = "waveform",
  color = "#9b87f5",
  backgroundColor = "#1a1b2e",
  className = "",
  qpixlData = null,
  temporalCoherence = 50,
}: VisualAnalyzerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    // Buffer for analyzer data
    let analyzerDataArray: Uint8Array | null = null;
    
    if (analyserNode) {
      // Configure and set up analyzer data buffer
      const bufferLength = type === "frequency" ? 
        analyserNode.frequencyBinCount : 
        analyserNode.fftSize;
        
      analyzerDataArray = new Uint8Array(bufferLength);
    }

    const simulateQuantumData = () => {
      const data = new Uint8Array(128);
      const time = Date.now() / 1000;
      
      for (let i = 0; i < data.length; i++) {
        // Simulate quantum interference patterns with sine waves of different frequencies
        const x = i / data.length;
        const wave1 = Math.sin(x * 5 + time) * 0.5;
        const wave2 = Math.sin(x * 17 + time * 1.3) * 0.3;
        const wave3 = Math.sin(x * 31 + time * 0.7) * 0.2;
        const wave4 = Math.sin(x * 67 + time * 1.9) * 0.1;
        data[i] = ((wave1 + wave2 + wave3 + wave4) * 0.5 + 0.5) * 255;
      }
      
      return data;
    };
    
    const drawQPIXLVisualization = () => {
      if (!ctx || !canvas) return;
      
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      
      // Generate quantum pixel grid based on qpixlData or simulate it
      const pixelSize = Math.floor(Math.min(width, height) / 16);
      const gridSize = Math.min(16, Math.floor(Math.sqrt(qpixlData ? qpixlData.length : 256)));
      
      // Grid starting position (centered)
      const offsetX = (width - pixelSize * gridSize) / 2;
      const offsetY = (height - pixelSize * gridSize) / 2;
      
      const time = Date.now() / 1000;
      const coherenceFactor = temporalCoherence / 100;
      
      // Draw quantum pixels
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const index = y * gridSize + x;
          let pixelValue = 0;
          
          if (qpixlData && index < qpixlData.length) {
            pixelValue = qpixlData[index];
          } else {
            // Generate simulated pixel value
            const normalizedX = x / gridSize;
            const normalizedY = y / gridSize;
            pixelValue = Math.sin(normalizedX * 5 + normalizedY * 7 + time * coherenceFactor) * 0.5 + 0.5;
          }
          
          // Determine pixel intensity
          const intensity = pixelValue * 255;
          
          // Create pixel gradient
          const gradient = ctx.createLinearGradient(
            offsetX + x * pixelSize,
            offsetY + y * pixelSize,
            offsetX + (x + 1) * pixelSize,
            offsetY + (y + 1) * pixelSize
          );
          
          gradient.addColorStop(0, `rgba(155, 135, 245, ${pixelValue.toFixed(2)})`);
          gradient.addColorStop(1, `rgba(196, 181, 253, ${(pixelValue * 0.7).toFixed(2)})`);
          
          // Draw pixel
          ctx.fillStyle = gradient;
          ctx.fillRect(
            offsetX + x * pixelSize, 
            offsetY + y * pixelSize, 
            pixelSize - 1, 
            pixelSize - 1
          );
          
          // Draw quantum connection lines (entanglement visualization)
          if ((x + y) % 3 === 0 && pixelValue > 0.5) {
            const targetX = Math.floor(Math.sin(time + x * y) * gridSize) % gridSize;
            const targetY = Math.floor(Math.cos(time + x + y) * gridSize) % gridSize;
            
            ctx.beginPath();
            ctx.moveTo(
              offsetX + x * pixelSize + pixelSize / 2,
              offsetY + y * pixelSize + pixelSize / 2
            );
            ctx.lineTo(
              offsetX + targetX * pixelSize + pixelSize / 2,
              offsetY + targetY * pixelSize + pixelSize / 2
            );
            ctx.strokeStyle = `rgba(155, 135, 245, ${(pixelValue * 0.3).toFixed(2)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Add glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }
      
      // Draw grid overlay
      ctx.strokeStyle = 'rgba(155, 135, 245, 0.2)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i <= gridSize; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(offsetX + i * pixelSize, offsetY);
        ctx.lineTo(offsetX + i * pixelSize, offsetY + gridSize * pixelSize);
        ctx.stroke();
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + i * pixelSize);
        ctx.lineTo(offsetX + gridSize * pixelSize, offsetY + i * pixelSize);
        ctx.stroke();
      }
    };

    const drawSimulation = () => {
      if (!ctx || !canvas) return;
      
      // Get dimensions
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      if (type === "qpixl") {
        drawQPIXLVisualization();
      } else if (type === "waveform") {
        // Either get real waveform data or simulate it
        let data: Uint8Array;
        
        if (analyserNode && analyzerDataArray) {
          analyserNode.getByteTimeDomainData(analyzerDataArray);
          data = analyzerDataArray;
        } else {
          data = simulateQuantumData();
        }
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        const sliceWidth = width / data.length;
        let x = 0;
        
        for (let i = 0; i < data.length; i++) {
          const y = height - (data[i] / 255.0) * height;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          
          x += sliceWidth;
        }
        
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (type === "frequency") {
        // Either get real frequency data or simulate it
        let data: Uint8Array;
        
        if (analyserNode && analyzerDataArray) {
          analyserNode.getByteFrequencyData(analyzerDataArray);
          data = analyzerDataArray;
        } else {
          data = simulateQuantumData();
        }
        
        const barWidth = width / Math.min(data.length, 128); // Limit to 128 bars
        
        for (let i = 0; i < Math.min(data.length, 128); i++) {
          const barHeight = (data[i] / 255) * height;
          
          // Create gradient
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, 'rgba(155, 135, 245, 0.2)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }
      } else if (type === "quantum") {
        // Simulate quantum interference pattern
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Quantum grid
        ctx.strokeStyle = "rgba(155, 135, 245, 0.1)";
        ctx.lineWidth = 0.5;
        
        const gridSize = 20;
        
        // Vertical lines
        for (let x = 0; x <= width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        
        // Draw quantum probability wave
        const time = Date.now() / 1000;
        const waveCount = 3;
        
        for (let wave = 0; wave < waveCount; wave++) {
          const hue = (wave / waveCount) * 60 + 260; // Range from purple to blue
          ctx.strokeStyle = `hsla(${hue}, 80%, 70%, 0.6)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          const frequency = 5 + wave * 3;
          const speed = 1 + wave * 0.5;
          const amplitude = 0.3 - wave * 0.05;
          
          for (let x = 0; x < width; x++) {
            const normalizedX = x / width;
            
            // Quantum wave formula with interference
            const y = height * 0.5 + 
                     Math.sin(normalizedX * frequency + time * speed) * height * amplitude + 
                     Math.sin(normalizedX * frequency * 2.1 + time * speed * 1.3) * height * amplitude * 0.5;
            
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.stroke();
          
          // Glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = `hsla(${hue}, 80%, 70%, 0.6)`;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        
        // Add quantum particles
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
          const x = width * 0.1 + (width * 0.8 * i / particleCount);
          
          // Particle follows the wave
          const normalizedX = x / width;
          const frequency = 5;
          const y = height * 0.5 + 
                   Math.sin(normalizedX * frequency + time) * height * 0.3;
          
          // Draw quantum particle
          const radius = 3 + Math.sin(time * 3 + i) * 1.5;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, 'rgba(196, 181, 253, 1)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const animate = () => {
      drawSimulation();
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("resize", resize);
    };
  }, [audioContext, analyserNode, type, color, backgroundColor, qpixlData, temporalCoherence]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
    />
  );
};

export default VisualAnalyzer;
