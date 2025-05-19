
import React, { useState } from "react";
import QuantumSynestheticViz from "@/components/QuantumSynestheticViz";

const PythonBridge = () => {
  const [wsPort, setWsPort] = useState(8765);
  
  return (
    <div className="h-screen w-screen bg-quantum-bg flex flex-col">
      {/* Header with connection info */}
      <div className="neumorph p-4 flex items-center justify-between">
        <h1 className="text-lg font-medium gradient-text">Python Quantum Bridge</h1>
        <div className="flex items-center space-x-2">
          <label htmlFor="port" className="text-sm">WebSocket Port:</label>
          <input
            id="port"
            type="number"
            value={wsPort}
            onChange={(e) => setWsPort(parseInt(e.target.value))}
            className="bg-quantum-surface border border-quantum-light rounded px-2 py-1 w-20 text-white"
          />
        </div>
      </div>
      
      {/* Visualizer */}
      <div className="flex-1">
        <QuantumSynestheticViz wsPort={wsPort} />
      </div>
      
      {/* Instructions */}
      <div className="neumorph p-4 max-h-48 overflow-auto text-sm">
        <h2 className="font-medium gradient-text mb-2">Connection Instructions:</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Run the Python WebSocket server:<br />
            <code className="bg-quantum-surface p-1 rounded text-xs block mt-1">
              python qpixl_synesthetic_bridge.py --mode demo --ws-port {wsPort}
            </code>
          </li>
          <li>
            The visualizer will automatically connect to the WebSocket server and display real-time quantum data.
          </li>
          <li>
            To generate the HTML file for standalone use:<br />
            <code className="bg-quantum-surface p-1 rounded text-xs block mt-1">
              python qpixl_synesthetic_bridge.py --mode html --ws-port {wsPort}
            </code>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default PythonBridge;
