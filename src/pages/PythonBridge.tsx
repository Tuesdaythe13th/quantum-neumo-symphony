
import React, { useState } from "react";
import { Wifi, Play, Settings as SettingsIconLucide, Info, Code, Eye, TestTube, Bug } from "lucide-react";
import QuantumSynestheticViz from "@/components/QuantumSynestheticViz";
import PythonCodeDisplay from "@/components/PythonCodeDisplay";

const PythonBridge = () => {
  const [wsPort, setWsPort] = useState<number>(8765);
  const [isPythonCommandCopied, setIsPythonCommandCopied] = useState(false);
  const [isHtmlCommandCopied, setIsHtmlCommandCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  
  // New state for debug panel and test data
  const [showDebug, setShowDebug] = useState(false);
  const [lastWebSocketMessage, setLastWebSocketMessage] = useState<any>(null);
  const [testQpixlState, setTestQpixlState] = useState<any>(null);

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

  // Test QPIXL data function
  const testQpixlMode = () => {
    // Create test data in the expected format
    const testData = {
      amplitude: 0.7,
      phase: Math.PI / 4,
      frequency: 440,
      entanglement: 0.6,
      compression_ratio: 0.3,
      quantum_noise: 0.1,
      // This triggers QPIXL mode
      probabilities: {
        "00": 0.35,
        "01": 0.25,
        "10": 0.20,
        "11": 0.20
      },
      debug_message: "✅ Test QPIXL data injected - Visualizer should switch to QPIXL mode"
    };
    
    // Set test state for visualizer
    setTestQpixlState(testData);
    
    // Update debug panel
    setLastWebSocketMessage({
      type: "quantum_state_update",
      data: testData
    });
  };

  // Reset test mode
  const resetTestMode = () => {
    setTestQpixlState(null);
    setLastWebSocketMessage(null);
  };

  // Handle data received from visualizer
  const handleDataReceived = (message: any) => {
    setLastWebSocketMessage(message);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/50 text-purple-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900/70 backdrop-blur-lg border-b border-purple-800/60 p-4">
        <div className="flex items-center justify-between">
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
          
          {/* Control toolbar */}
          <div className="flex items-center gap-3">
            {/* Test Controls */}
            <button 
              onClick={testQpixlMode}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-green-700 hover:bg-green-600 rounded-md transition-colors"
              title="Test QPIXL visualization mode"
            >
              <TestTube size={14} />
              Test QPIXL Mode
            </button>
            
            {/* Reset Test Mode */}
            {testQpixlState && (
              <button 
                onClick={resetTestMode}
                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-red-700 hover:bg-red-600 rounded-md transition-colors"
                title="Clear test data and return to WebSocket mode"
              >
                Reset Test
              </button>
            )}
            
            {/* Debug Toggle */}
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-orange-700 hover:bg-orange-600 rounded-md transition-colors"
            >
              <Bug size={14} />
              {showDebug ? "Hide Debug" : "Show Debug"}
            </button>
            
            {/* Code Toggle */}
            <button 
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-purple-700 hover:bg-purple-600 rounded-md transition-colors"
            >
              {showCode ? <Eye size={14} /> : <Code size={14} />}
              {showCode ? "Hide Code" : "Show QPIXL Code"}
            </button>
            
            {/* Port Input */}
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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Visualizer Area */}
        <div className="flex-1 overflow-hidden bg-black">
          {(wsPort > 1023 && wsPort < 65536) ? (
            <QuantumSynestheticViz 
              wsPort={wsPort} 
              externalQuantumState={testQpixlState}
              onDataReceived={handleDataReceived}
            />
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

        {/* Debug Panel */}
        {showDebug && (
          <div className="bg-gray-900/95 border-t border-orange-800/60 p-4 max-h-64 overflow-y-auto">
            <h3 className="text-orange-300 font-semibold mb-3 flex items-center gap-2">
              <Bug size={16} />
              Debug: WebSocket Data Analysis
            </h3>
            
            {lastWebSocketMessage ? (
              <div className="space-y-3">
                {/* Test Mode Indicator */}
                {testQpixlState && (
                  <div className="bg-green-900/20 border border-green-700/50 p-2 rounded">
                    <span className="text-green-400 font-semibold">🧪 TEST MODE ACTIVE</span>
                    <span className="text-gray-400 text-xs ml-2">Visualizer is using injected test data</span>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-semibold text-cyan-300 mb-1">Current Data Source:</h4>
                  <pre className="text-xs text-gray-300 bg-black/40 p-3 rounded overflow-x-auto">
                    {JSON.stringify(lastWebSocketMessage, null, 2)}
                  </pre>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-black/20 p-2 rounded">
                    <strong className="text-blue-300">Message Type:</strong> 
                    <span className={lastWebSocketMessage.type === 'quantum_state_update' ? 'text-green-400' : 'text-red-400'}>
                      {lastWebSocketMessage.type || 'Not found'}
                    </span>
                  </div>
                  
                  <div className="bg-black/20 p-2 rounded">
                    <strong className="text-blue-300">Has Probabilities:</strong> 
                    <span className={lastWebSocketMessage.data?.probabilities ? 'text-green-400' : 'text-red-400'}>
                      {lastWebSocketMessage.data?.probabilities ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  
                  {lastWebSocketMessage.data?.probabilities && (
                    <div className="col-span-2 bg-black/20 p-2 rounded">
                      <strong className="text-blue-300">QPIXL States:</strong> 
                      <span className="text-green-400">
                        {Object.keys(lastWebSocketMessage.data.probabilities).length} quantum states detected
                      </span>
                      <div className="text-gray-400 mt-1">
                        {Object.entries(lastWebSocketMessage.data.probabilities).map(([state, prob]: [string, any]) => (
                          <span key={state} className="mr-2">|{state}⟩: {(typeof prob === 'number' ? (prob * 100).toFixed(1) : 0)}%</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                No WebSocket messages received yet. Try:
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Starting the Python backend server</li>
                  <li>Clicking "Test QPIXL Mode" button</li>
                  <li>Checking that the WebSocket port is correct</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Python Code Display Panel */}
        {showCode && (
          <div className="bg-gray-900/90 border-t border-purple-800/60 max-h-60 overflow-hidden">
            <PythonCodeDisplay className="h-full" />
          </div>
        )}
      </div>

      {/* Instructions Panel */}
      <div className="bg-gray-900/70 backdrop-blur-lg border-t border-purple-800/60 p-4 text-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
            <Play size={20} className="text-green-400"/>
            Demo Instructions
          </h2>
          <span className="text-xs text-gray-500">
            {testQpixlState ? "🧪 Test Mode Active - Click 'Reset Test' to return to WebSocket" : "Use 'Test QPIXL Mode' if Python server is not available"}
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Python Backend Setup */}
          <div className="bg-black/40 p-3 rounded-lg border border-gray-700/60">
            <h3 className="text-sm font-semibold text-cyan-300 mb-2">1. Start Python Backend:</h3>
            <div className="bg-gray-800 p-2 rounded font-mono text-xs relative group">
              <span className="text-green-300 mr-1">$</span>{pythonDemoCommand}
              <button
                onClick={() => copyToClipboard(pythonDemoCommand, "demo")}
                className="absolute top-1 right-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isPythonCommandCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              This sends properly formatted QPIXL data via WebSocket
            </p>
          </div>
          
          {/* Expected Data Format */}
          <div className="bg-black/40 p-3 rounded-lg border border-gray-700/60">
            <h3 className="text-sm font-semibold text-cyan-300 mb-2">2. Required Data Format:</h3>
            <div className="bg-gray-800 p-2 rounded text-xs">
              <pre className="text-gray-300">{`{
  "type": "quantum_state_update",
  "data": {
    "probabilities": {
      "00": 0.25,
      "01": 0.35,
      "10": 0.20,
      "11": 0.20
    }
  }
}`}</pre>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              The "probabilities" object triggers QPIXL mode
            </p>
          </div>
          
          {/* Troubleshooting */}
          <div className="bg-blue-900/25 border border-blue-700/50 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
              <Info size={16}/> Troubleshooting
            </h3>
            <ul className="text-xs list-disc list-inside space-y-1 text-gray-400">
              <li><strong>Not switching to QPIXL mode?</strong> Check if "probabilities" object exists in debug panel</li>
              <li><strong>No WebSocket data?</strong> Ensure Python server is running and port matches</li>
              <li><strong>Testing without Python?</strong> Use "Test QPIXL Mode" button to simulate data</li>
              <li><strong>Still not working?</strong> Check browser console for errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonBridge;
