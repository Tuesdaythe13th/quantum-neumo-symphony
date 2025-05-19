
import React, { useState } from "react";
import { Wifi, Play, Settings as SettingsIconLucide, Info } from "lucide-react";
import QuantumSynestheticViz from "@/components/QuantumSynestheticViz";

const PythonBridge = () => {
  const [wsPort, setWsPort] = useState<number>(8765);
  const [isPythonCommandCopied, setIsPythonCommandCopied] = useState(false);
  const [isHtmlCommandCopied, setIsHtmlCommandCopied] = useState(false);

  const pythonDemoCommand = `python qpixl_synesthetic_bridge.py --mode demo --ws-port ${wsPort}`;
  const pythonHtmlCommand = `python qpixl_synesthetic_bridge.py --mode html --ws-port ${wsPort}`;

  const handlePortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const portValue = event.target.value;
    if (portValue === "") {
      setWsPort(0);
      return;
    }
    const port = parseInt(portValue, 10);
    if (!isNaN(port) && port > 1023 && port < 65536) {
      setWsPort(port);
    }
  };

  const copyToClipboard = (text: string, which: "demo" | "html") => {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (which === "demo") setIsPythonCommandCopied(true);
        if (which === "html") setIsHtmlCommandCopied(true);
        setTimeout(() => {
          if (which === "demo") setIsPythonCommandCopied(false);
          if (which === "html") setIsHtmlCommandCopied(false);
        }, 1600);
      });
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/50 text-purple-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900/70 backdrop-blur-lg border-b border-purple-800/60 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
            <Wifi size={24} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Python Quantum Bridge
            </h1>
            <p className="text-sm text-gray-400">
              Live Link: <span className="font-mono text-cyan-300">ws://localhost:{wsPort > 0 ? wsPort : "----"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="wsPortInput" className="text-sm font-medium text-gray-300">
            WS Port:
          </label>
          <input
            id="wsPortInput"
            type="number"
            value={wsPort === 0 ? '' : wsPort}
            onChange={handlePortChange}
            placeholder="8765"
            className="bg-gray-800 border border-gray-600 rounded-md px-2 py-1.5 w-20 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            min="1024"
            max="65535"
          />
        </div>
      </div>
      {/* Main Visualizer Area */}
      <div className="flex-1 overflow-hidden bg-black">
        {(wsPort > 1023 && wsPort < 65536) ? (
          <QuantumSynestheticViz wsPort={wsPort} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="bg-gray-800/80 p-8 rounded-xl border border-purple-700/60 max-w-md text-center">
              <SettingsIconLucide size={32} className="mx-auto mb-4 text-yellow-400" />
              <h2 className="text-xl font-bold text-yellow-300 mb-3">Setup WebSocket Port</h2>
              <p className="text-purple-200 text-sm">
                Please enter a valid port number (e.g., 8765) to connect the visualizer.
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Instructions Panel */}
      <div className="bg-gray-900/70 backdrop-blur-lg border-t border-purple-800/60 p-4 max-h-60 overflow-y-auto text-sm">
        <h2 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
          <Play size={20} className="text-green-400"/>
          Demo Instructions
        </h2>
        <div className="bg-black/40 p-3 rounded-lg border border-gray-700/60 mb-3">
          <h3 className="text-sm font-semibold text-cyan-300 mb-2">Start Python Backend:</h3>
          <div className="bg-gray-800 p-2 rounded font-mono text-xs relative group">
            <span className="text-green-300 mr-1">$</span>{pythonDemoCommand}
            <button
              onClick={() => copyToClipboard(pythonDemoCommand, "demo")}
              className="absolute top-1 right-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isPythonCommandCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div className="bg-black/40 p-3 rounded-lg border border-gray-700/60 mb-3">
          <h3 className="text-sm font-semibold text-cyan-300 mb-2">Standalone HTML Visualizer:</h3>
          <div className="bg-gray-800 p-2 rounded font-mono text-xs relative group">
            <span className="text-green-300 mr-1">$</span>{pythonHtmlCommand}
            <button
              onClick={() => copyToClipboard(pythonHtmlCommand, "html")}
              className="absolute top-1 right-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isHtmlCommandCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-1.5">Then open <code className="bg-gray-700 px-1 rounded mx-0.5">quantum_synesthetic_demo.html</code>.</p>
        </div>
        <div className="p-3 bg-blue-900/25 border border-blue-700/50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <Info size={16}/> Track 1 Demo Tips
          </h3>
          <ul className="text-xs list-disc list-inside space-y-1 text-gray-400">
            <li>Python simulates QPIXL-inspired quantum states</li>
            <li>Visualizer shows real-time synesthetic mapping</li>
            <li>Each preset represents different quantum alterations</li>
            <li>Export frames to capture quantum art moments</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PythonBridge;
