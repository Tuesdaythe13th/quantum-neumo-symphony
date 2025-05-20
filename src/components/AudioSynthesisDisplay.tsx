
import React from 'react';
import { cn } from "@/lib/utils";

interface AudioSynthesisDisplayProps {
  className?: string;
  title: string;
  children: React.ReactNode;
}

const AudioSynthesisDisplay: React.FC<AudioSynthesisDisplayProps> = ({ 
  className,
  title,
  children
}) => {
  return (
    <div className={cn("neumorph p-4 rounded-xl", className)}>
      <h3 className="text-lg font-medium text-quantum-accent mb-3">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

export default AudioSynthesisDisplay;
