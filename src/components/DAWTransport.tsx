
import React, { useState } from "react";
import { Play, Stop, Download, Save, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface DAWTransportProps {
  onPlay: () => void;
  onStop: () => void;
  onSave: () => void;
  onExport: () => void;
  onSettings: () => void;
  isPlaying: boolean;
  className?: string;
}

const DAWTransport: React.FC<DAWTransportProps> = ({
  onPlay,
  onStop,
  onSave,
  onExport,
  onSettings,
  isPlaying,
  className,
}) => {
  const [bpm, setBpm] = useState(128);

  return (
    <div className={cn("neumorph flex items-center p-2 gap-4", className)}>
      <div className="flex items-center gap-2">
        <button
          onClick={isPlaying ? onStop : onPlay}
          className={cn(
            "p-3 rounded-full transition-all",
            isPlaying
              ? "neumorph-active text-red-400"
              : "neumorph text-quantum-glow"
          )}
          aria-label={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? (
            <Stop className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-4 mx-4">
        <div className="flex flex-col items-center">
          <label className="text-xs text-quantum-muted">BPM</label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Math.max(20, Math.min(300, parseInt(e.target.value) || 0)))}
            className="w-14 bg-quantum-light rounded px-2 py-1 text-center text-sm font-mono border-none outline-none focus:ring-1 focus:ring-quantum-accent"
          />
        </div>

        <div className="h-10 border-l border-quantum-muted mx-2"></div>

        <div className="font-mono text-xl text-white tracking-wider">
          00:00:00
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onSave}
          className="neumorph p-2 rounded-md text-white hover:text-quantum-glow transition-colors"
          aria-label="Save"
        >
          <Save className="h-5 w-5" />
        </button>
        <button
          onClick={onExport}
          className="neumorph p-2 rounded-md text-white hover:text-quantum-glow transition-colors"
          aria-label="Export"
        >
          <Download className="h-5 w-5" />
        </button>
        <button
          onClick={onSettings}
          className="neumorph p-2 rounded-md text-white hover:text-quantum-glow transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default DAWTransport;
