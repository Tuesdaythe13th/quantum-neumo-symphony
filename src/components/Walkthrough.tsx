import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, HelpCircle, ChevronsRight } from 'lucide-react';

type TutorialStep = {
  title: string;
  content: React.ReactNode;
  highlight?: string; // CSS selector to highlight
};

interface WalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: TutorialStep[];
  position?: 'right' | 'top'; // Added position prop
}

// Define default steps for main Index.tsx interface with DAW
const defaultSteps: TutorialStep[] = [
  {
    title: "Welcome to the Quantum Synesthetic Mapper!",
    content: (
      <div className="space-y-2">
        <p>This is a quantum-inspired digital audio workstation and visual synthesizer in one interface.</p>
        <p className="text-green-400">It creates both sound and visuals from the same quantum data!</p>
      </div>
    )
  },
  {
    title: "Quantum Controls",
    content: (
      <div className="space-y-2">
        <p>Adjust these knobs to control quantum parameters:</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li><span className="text-purple-400">Superposition</span>: Controls quantum state overlap</li>
          <li><span className="text-purple-400">Entanglement</span>: Links quantum particles together</li>
          <li><span className="text-purple-400">Qubits</span>: Number of quantum bits in the system</li>
        </ul>
      </div>
    ),
    highlight: ".quantum-knobs-section" // Ensure this class exists on the knobs container
  },
  {
    title: "QPIXL Integration",
    content: (
      <div className="space-y-2">
        <p>Enable <span className="text-cyan-400">QPIXL Integration</span> to use quantum probability grids.</p>
        <p className="text-xs">QPIXL uses quantum compression to encode data in fewer qubits.</p>
        <p className="text-xs text-purple-300">Adjust QPIXL Compression to see how it affects the visualization!</p>
      </div>
    ),
    highlight: ".qpixl-toggle-section" // Ensure this class exists on the QPIXL controls container
  },
  {
    title: "Visual Analyzer",
    content: (
      <div className="space-y-2">
        <p>Watch how the visualization changes with your settings.</p>
        <p className="text-xs">When QPIXL is active, you'll see a grid representing quantum probabilities.</p>
        <p className="text-xs text-purple-300">This is the same data that drives the audio synthesis!</p>
      </div>
    ),
    highlight: ".visual-analyzer-section" // Ensure this class exists on the VisualAnalyzer container
  },
  {
    title: "Audio Transport",
    content: (
      <div className="space-y-2">
        <p>Use these controls to play and control the quantum audio:</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li><span className="text-green-400">Play</span>: Generate and play quantum sound</li>
          {/* Assuming no Loop button for now, can be added if it exists */}
          {/* <li><span className="text-blue-400">Loop</span>: Repeat the quantum audio pattern</li> */}
          <li><span className="text-yellow-400">Volume</span>: Adjust the master volume (part of Audio Output)</li>
        </ul>
      </div>
    ),
    highlight: ".daw-transport-section" // Ensure this class exists on DAWTransport container
  },
  {
    title: "Advanced Audio Settings",
    content: (
      <div className="space-y-2">
        <p>Expand this panel to access advanced audio controls:</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li><span className="text-purple-400">Additive Synthesis</span>: Creates complex timbres</li>
          <li><span className="text-purple-400">Musical Scale</span>: Maps quantum data to musical notes</li>
          {/* Harmonics might be part of Additive Synthesis */}
          {/* <li><span className="text-purple-400">Harmonics</span>: Controls overtone structure</li> */}
        </ul>
      </div>
    ),
    highlight: ".advanced-audio-accordion" // Ensure this class exists on the Accordion for advanced audio
  },
  {
    title: "Experience Quantum Synesthesia!",
    content: (
      <div className="space-y-2">
        <p>Now try this sequence for the full experience:</p>
        <ol className="list-decimal list-inside text-xs space-y-1">
          <li>Enable QPIXL Integration</li>
          <li>Adjust Quantum Controls and watch the visualization</li>
          <li>Press Play to hear the quantum audio</li>
          <li>Notice how sound and visuals change together!</li>
        </ol>
        <p className="text-green-400 mt-2">That's quantum synesthesia - where quantum data creates both sound and visuals simultaneously!</p>
      </div>
    )
  }
];

const Walkthrough: React.FC<WalkthroughProps> = ({ 
  isOpen = false,
  onClose,
  steps = defaultSteps,
  position = 'right' // Default to right side
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const highlightRef = useRef<HTMLElement | null>(null);
  const originalStylesRef = useRef<{ outline: string; boxShadow: string; zIndex: string; position: string; } | null>(null);

  // Reset to first step when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsCollapsed(false);
    }
  }, [isOpen]);

  // Highlight effect
  useEffect(() => {
    // Clear previous highlight
    if (highlightRef.current && originalStylesRef.current) {
      highlightRef.current.style.outline = originalStylesRef.current.outline;
      highlightRef.current.style.boxShadow = originalStylesRef.current.boxShadow;
      highlightRef.current.style.zIndex = originalStylesRef.current.zIndex;
      highlightRef.current.style.position = originalStylesRef.current.position;
      highlightRef.current = null;
      originalStylesRef.current = null;
    }

    if (isOpen && steps[currentStep]?.highlight) {
      const el = document.querySelector(steps[currentStep].highlight!) as HTMLElement;
      if (el) {
        highlightRef.current = el;
        originalStylesRef.current = {
          outline: el.style.outline,
          boxShadow: el.style.boxShadow,
          zIndex: el.style.zIndex,
          position: el.style.position,
        };

        el.style.outline = '2px solid rgba(139, 92, 246, 0.8)'; // Purple-ish highlight
        el.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.5)';
        el.style.zIndex = '1000'; // Ensure highlight is on top
        if (el.style.position === 'static' || !el.style.position) {
          el.style.position = 'relative'; // Needed for z-index to reliably work
        }
      }
    }

    // Cleanup on component unmount or when isOpen changes
    return () => {
      if (highlightRef.current && originalStylesRef.current) {
        highlightRef.current.style.outline = originalStylesRef.current.outline;
        highlightRef.current.style.boxShadow = originalStylesRef.current.boxShadow;
        highlightRef.current.style.zIndex = originalStylesRef.current.zIndex;
        highlightRef.current.style.position = originalStylesRef.current.position;
      }
    };
  }, [currentStep, steps, isOpen]);

  if (!isOpen) return null;

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  if (position === 'top') {
    return (
      <div className="fixed inset-x-0 top-0 z-[100] flex justify-center pointer-events-none"> {/* z-index high, pointer-events-none for container */}
        <div 
          className={`flex w-full max-w-2xl transition-transform duration-300 ease-in-out pointer-events-auto ${ /* pointer-events-auto for panel */ }
            isCollapsed 
              ? '-translate-y-[calc(100%-3rem)]'  /* Adjust 3rem to match visible tab height */
              : 'translate-y-0'
          }`}
        >
          <div className="bg-gray-900/90 backdrop-blur-md border-b border-purple-900/50 shadow-2xl w-full flex flex-col mt-2 rounded-b-lg"> {/* Added mt-2 and rounded-b-lg */}
            {/* Main content and controls row */}
            <div className="flex flex-row items-start p-3">
              {/* Step content on the left */}
              <div className="flex-1 overflow-auto pr-3">
                <h4 className="text-sm font-bold text-purple-300 mb-1">
                  {currentStepData.title}
                </h4>
                <div className="text-xs text-gray-200">
                  {currentStepData.content}
                </div>
              </div>

              {/* Vertical divider and Nav controls on the right */}
              <div className="border-l border-gray-700/50 pl-3 flex flex-col items-center space-y-2">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-purple-300 p-1 rounded-full hover:bg-gray-700/50"
                  aria-label="Close guide"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={prevStep}
                  disabled={isFirstStep}
                  className={`p-1 rounded-full ${isFirstStep ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-purple-300 hover:bg-gray-700/50'}`}
                  aria-label="Previous step"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={isLastStep ? onClose : nextStep}
                  className={`p-1 rounded-full ${isLastStep ? 'text-green-400 hover:text-green-300' : 'text-gray-300 hover:text-purple-300 hover:bg-gray-700/50'}`}
                  aria-label={isLastStep ? "Finish guide" : "Next step"}
                >
                  {isLastStep ? <ChevronsRight size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>
            </div>
            {/* Progress and Collapse Toggle Row */}
            <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-gray-700/30">
                <div className="text-[10px] text-purple-400">
                  Step {currentStep + 1} of {totalSteps}
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="bg-purple-700/50 hover:bg-purple-600/50 text-purple-200 rounded-md px-2 py-0.5 text-xs"
                    aria-label={isCollapsed ? "Expand walkthrough" : "Collapse walkthrough"}
                >
                    {isCollapsed ? "Expand" : "Collapse"}
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default right-side panel (remains largely the same as user's last full version)
  return (
    <div className="fixed inset-y-0 right-0 z-[100] flex items-center pointer-events-none"> {/* z-index high, pointer-events-none for container */}
      <div 
        className={`flex h-full transition-transform duration-300 ease-in-out pointer-events-auto ${  /* pointer-events-auto for panel */ }
          isCollapsed 
            ? 'translate-x-[calc(100%-3rem)]' /* Adjust 3rem to match visible tab height */
            : 'translate-x-0'
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="self-center -ml-[calc(3rem-1px)] h-12 w-12 bg-purple-700/80 hover:bg-purple-600/80 text-white rounded-l-md p-1 shadow-lg z-10 flex items-center justify-center" // Adjusted margin and size
          aria-label={isCollapsed ? "Expand walkthrough" : "Collapse walkthrough"}
        >
          {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div className="bg-gray-900/90 backdrop-blur-md border-l border-purple-900/50 shadow-2xl h-full max-w-xs w-full flex flex-col">
          <div className="p-3 border-b border-gray-800/70 flex justify-between items-center bg-gray-950/50">
            <h3 className="font-bold text-purple-300 flex items-center gap-2 text-sm"> {/* Reduced font size */}
              <HelpCircle size={18} />
              <span>Interface Guide</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-purple-300 p-1 rounded-full hover:bg-gray-700/50"
              aria-label="Close guide"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 py-2 border-b border-gray-800/70 flex gap-1.5"> {/* Increased gap */}
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full flex-1 transition-colors ${ /* Added transition */ }
                  idx === currentStep 
                    ? 'bg-purple-500' 
                    : idx < currentStep 
                      ? 'bg-purple-800/70'  /* Made previous steps slightly dimmer */
                      : 'bg-gray-700/70'   /* Made upcoming steps slightly dimmer */
                }`}
              />
            ))}
          </div>

          <div className="p-4 flex-1 overflow-auto">
            <h4 className="text-md font-bold text-purple-200 mb-2"> {/* Adjusted color and margin */}
              {currentStepData.title}
            </h4>
            <div className="text-sm text-gray-300 leading-relaxed"> {/* Added leading-relaxed */}
              {currentStepData.content}
            </div>
          </div>

          <div className="p-3 border-t border-gray-800/70 flex justify-between items-center bg-gray-950/50">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={`px-4 py-1.5 rounded-md text-xs font-medium ${ /* Adjusted padding and font */ }
                isFirstStep 
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white'
              }`}
            >
              Back
            </button>

            <div className="text-xs text-gray-500">
              {currentStep + 1} / {totalSteps}
            </div>

            <button
              onClick={isLastStep ? onClose : nextStep}
              className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 ${ /* Adjusted padding and font */ }
                isLastStep 
                  ? 'bg-green-600 hover:bg-green-500 text-white' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isLastStep ? "Finish" : "Next"}
              {isLastStep && <ChevronsRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Walkthrough;
