
import React, { useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface AudioWaveformDisplayProps {
  className?: string;
  analyserNode: AnalyserNode | null;
  color?: string;
  backgroundColor?: string;
}

const AudioWaveformDisplay: React.FC<AudioWaveformDisplayProps> = ({ 
  className,
  analyserNode,
  color = '#9b87f5',
  backgroundColor = 'rgba(0, 0, 0, 0.2)'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!ctx || !canvas) return;
      
      // Request next animation frame
      const animationId = requestAnimationFrame(draw);
      
      // Get canvas dimensions
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      
      // Get waveform data
      analyserNode.getByteTimeDomainData(dataArray);
      
      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.beginPath();
      
      const sliceWidth = width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (height / 2);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      
      return () => {
        cancelAnimationFrame(animationId);
      };
    };
    
    // Start drawing
    draw();
    
    // Cleanup on unmount
    return () => {
      // The cleanup is handled in the draw function
    };
  }, [analyserNode, color, backgroundColor]);
  
  // Set canvas size when component mounts or resizes
  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <div className={cn("w-full h-full relative", className)}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default AudioWaveformDisplay;
