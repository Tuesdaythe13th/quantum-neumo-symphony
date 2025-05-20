# 🎵 Quantum Synesthetic Mapper 🌌

## ✨ Overview

Welcome to the **Quantum Synesthetic Mapper**! This novel web application pioneers a unique intersection of quantum computing, audio synthesis, and visual art. It generates deeply interconnected, real-time audio and visuals directly from quantum phenomena – whether simulated quantum states or live data streamed in the custom **QPIXL** (Quantum Pixel Information eXchange Language) format. Dive into an immersive experience where you don't just see data, you hear and feel its quantum essence, all orchestrated through an intuitive DAW-like interface designed for artists, researchers, and the quantum-curious alike. This isn't just a data visualizer; it's an instrument that plays the quantum world.

## 🚀 Key Features

*   **True Synesthesia Engine:** Experience audio and visuals born from the exact same quantum dataset. Parameters like quantum probabilities and QPIXL data arrays simultaneously drive pixel colors, musical notes, and timbral qualities, creating an authentic sensory fusion.
*   **Dynamic Multi-Mode Visualizer:**
    *   **Waveform Display:** Classic representation of audio output.
    *   **Frequency Spectrum:** Analyze the frequency components of the sound.
    *   **Quantum Interference Simulation:** Abstract generative visuals inspired by quantum wave behavior.
    *   **QPIXL Grid Display:** The star of the show! Renders quantum state probabilities (from the `probabilities` object) and/or raw `qpixlData` arrays as a vivid, interactive grid. Features advanced HSL color mapping, per-pixel borders, and a configurable glow effect for stunning clarity.
*   **Quantum-Driven Audio Synthesis:** A sophisticated audio engine where quantum parameters (e.g., entanglement, superposition, qubit measurements) directly modulate sound characteristics, including pitch, amplitude, timbre (via additive synthesis), and effects.
*   **Interactive DAW-like Interface (`Index.tsx`):**
    *   **Prominent Visualizer:** A large, central canvas for an immersive visual experience.
    *   **Comprehensive Quantum Controls:** Dedicated sections for core quantum parameters (Qubits, Shots, Entanglement, Superposition, Q-Filter), QPIXL-specific settings (Integration toggle, Harmony, Spectral Mapping, Compression, Coherence), and audio effects (Reverb, Chorus, Stereo).
    *   **Advanced Audio Panel:** Accordion-style access to Master Volume, Additive Synthesis, and Musical Scale mapping.
    *   **Quantum Matrix Pad:** An X-Y controller for intuitive, real-time manipulation of linked quantum parameters.
    *   **Standard Transport & Output:** Includes Play/Stop controls, BPM, and a compact audio output waveform display.
*   **Versatile Python Bridge (`/python-bridge` page):**
    *   **Live Data Integration:** Connect to external Python backends (simulators or QPUs) via WebSockets to stream real quantum data into the visualizer.
    *   **"Test QPIXL Mode":** A robust built-in testing utility that injects sample quantum `probabilities` (to trigger QPIXL mode) and `qpixlData` (Float32Array for grid visuals), allowing full QPIXL demo capabilities without a Python backend.
    *   **Developer Tools:** Includes a debug panel for inspecting incoming data and a display for the example Python bridge script.
*   **Built-in Interactive Walkthrough Guide:**
    *   An elegant, step-by-step tutorial (accessible via a Help icon) that slides out from the top of the main interface.
    *   Guides users through key features and UI elements, with an option to highlight relevant sections on the page.
*   **Responsive & Modern UI:**
    *   Thoughtfully designed layout that adapts for usability on desktop and mobile devices, using accordions and responsive stacking for complex control sets.
    *   Built with React, TypeScript, Vite, and styled with Tailwind CSS, featuring a dark, neumorphic aesthetic.

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (with Neumorphic design elements and dark theme)
*   **State Management:** React Hooks (`useState`, `useEffect`, `useRef`)
*   **Charting/Visualization:** HTML5 Canvas API (custom implementation)
*   **Icons:** Lucide React
*   **Toasts/Notifications:** Sonner
*   **Theming:** `next-themes`

## 🏁 Getting Started

### Prerequisites
*   Node.js (e.g., v18.x or later)
*   npm, yarn, pnpm, or bun (this guide will use `npm` for examples)
*   Git

### Installation
1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
    *(Replace `<repository-url>` and `<repository-name>` with actual values)*
2.  Install dependencies:
    ```bash
    npm install 
    ```
    *(Or `yarn install`, `bun install` if you use those package managers)*

### Running the Development Server
1.  Start the Vite development server:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:5173` (or the port specified in your console output).

## 🎹 Using the Application

The Quantum Synesthetic Mapper is primarily controlled through its main Digital Audio Workstation (DAW)-like interface, accessible at the root path (`/`) of the application.

### Main DAW Interface (Homepage `/`)

The interface is designed to provide a comprehensive environment for both manipulating quantum parameters and experiencing their audio-visual output. It's organized into several key areas:

#### Layout Overview
The main interface features a multi-column layout on desktop screens (typically a 4-column grid), which responsively stacks for usability on mobile devices.
*   **Top Bar:** Contains the main transport controls.
*   **Left Column (Desktop):** Houses core synthesis parameters and the Quantum Matrix Pad.
*   **Center Area (Desktop - Spans 2 Columns):** Dominated by the large Quantum Visualizer, with the Audio Output section directly below it.
*   **Right Column (Desktop - Accordion):** Provides access to detailed QPIXL settings, Audio Effects, Advanced Synthesis options, and Analysis panels. This entire column is collapsible to save space.

#### 1. 🎧 DAW Transport
*   **Location:** Top of the page.
*   **Controls:**
    *   **Play/Stop Button:** The primary control to start and stop the quantum audio synthesis and visualization. Pressing **Play** will:
        *   Initialize the audio engine (if not already active on first interaction).
        *   Generate new audio and QPIXL data based on the current settings (especially if starting from a stopped state or if settings have changed).
        *   Begin playback and real-time visualization.
    *   **BPM Display:** Shows the current tempo (currently non-interactive, for future use).
    *   **Time Display:** Shows the current playback time.
    *   **Save/Export/Settings Buttons:** Placeholder buttons for future functionality (e.g., saving presets, exporting audio).
    *   **Upload/Download Buttons:** Placeholder buttons for future file operations.
    *   **Walkthrough Guide (❔ HelpCircle Icon):** Click this to open an interactive step-by-step guide to the interface.

#### 2. 🖼️ Quantum Visualizer Area
*   **Location:** Prominently in the center of the interface.
*   **Main Display (`VisualAnalyzer`):** A large canvas where the audio-visual synthesis is rendered.
*   **Visualizer Type Selectors:** Buttons located below the main display to switch between different visualization modes:
    *   **Waveform:** Displays the audio output as a time-domain waveform.
    *   **Spectrum:** Shows the frequency spectrum of the audio.
    *   **Quantum:** A generative visual simulation inspired by quantum interference patterns.
    *   **QPIXL:** Renders a grid based on quantum `probabilities` and/or raw `qpixlData` (Float32Array). This mode shows the direct visual output of the QPIXL data, with cell color/intensity mapped from the data values using an HSL gradient.
*   **QPIXL Status Indicator:** Text below the type selectors indicating the current status of QPIXL data (e.g., "QPIXL Data Loaded," "QPIXL Active - No Data," "QPIXL Integration Disabled").

#### 3. 🎛️ Core Synthesis Controls
*   **Location:** Typically in the left column on desktop. This section is labeled "Core Synthesis".
*   **Controls (`.quantum-knobs-section` for Walkthrough):**
    *   **Quantum Knobs:**
        *   **Qubits:** Slider to set the number of simulated quantum bits.
        *   **Shots:** Slider to set the number of simulated measurements (shots).
        *   **Entanglement:** Knob to control the level of quantum entanglement.
        *   **Superposition:** Knob to control the degree of superposition.
        *   **Q-Filter:** Knob to adjust a quantum-inspired filter effect.
    *   **Waveform Selector:** Buttons to choose the base oscillator waveform (Sine, Square, Triangle, Sawtooth, Quantum Noise) for the audio engine.

#### 4. 🖐️ Quantum Matrix Pad
*   **Location:** Typically in the left column, below Core Synthesis controls, labeled "Quantum Matrix".
*   **Functionality:** An X-Y pad that allows intuitive, real-time control over two linked quantum parameters (e.g., mapping X to Decoherence and Y to Amplitude). Moving the cursor on the pad changes these parameters, affecting both sound and visuals.

#### 5. 🔮 QPIXL Settings (Accordion Item in Right Column)
*   **Location:** Within the main accordion in the right column, labeled "QPIXL Settings" (`.qpixl-toggle-section` for Walkthrough).
*   **Controls:**
    *   **QPIXL Integration Switch:** Toggles the use of QPIXL data in the audio synthesis and forces the visualizer to attempt QPIXL mode if data is available. Instructional toasts will guide you when this is changed.
    *   **Quantum Harmony Switch:** Toggles a quantum harmony effect.
    *   **Spectral Mapping Selector:** Dropdown to choose how QPIXL data maps to spectral characteristics of the sound.
    *   **Compression Slider:** Adjusts the QPIXL compression threshold.
    *   **Temporal Coherence Slider:** Controls the temporal coherence for QPIXL data generation.

#### 6. 🔊 Audio Effects (Accordion Item in Right Column)
*   **Location:** Within the main accordion in the right column, labeled "Audio Effects".
*   **Controls:**
    *   **Reverb Switch & Mix Slider.**
    *   **Chorus Switch.**
    *   **Stereo Switch.**

#### 7. 🔬 Advanced Synthesis (Accordion Item in Right Column)
*   **Location:** Within the main accordion in the right column, labeled "Advanced Synthesis" (`.advanced-audio-accordion` for Walkthrough). This section itself uses internal accordions for its content.
*   **Controls (inside `QuantumAdvancedAudio`):**
    *   **Master Volume Control:** (Usually open by default) Slider for overall output volume.
    *   **Additive Synthesis Control:** (Collapsed by default) Controls for enabling and shaping additive synthesis (number of partials, harmonic mapping, etc.).
    *   **Musical Scale Control:** (Collapsed by default) Options to map quantum data to musical scales, select root notes, and choose QPIXL note selection methods.

#### 8. 📊 Analysis Panels (Accordion Item in Right Column)
*   **Location:** Within the main accordion in the right column, labeled "Analysis".
*   **Content:**
    *   **Quantum Circuit Display:** A visual representation of the simulated quantum circuit based on current settings.
    *   **Measurement Analysis:** Displays the probabilities of different quantum states after measurement.

#### 9. 🎼 Audio Output Section
*   **Location:** Typically in the center area, directly below the main Visualizer.
*   **Content:**
    *   **Mini Waveform Display:** A smaller, real-time waveform of the current audio output.
    *   **Playback Progress Bar & Time:** Shows the current position in the generated audio loop.
    *   *(Note: The main master volume control is primarily located within the "Advanced Synthesis" accordion item).*

### 🐍 Python Bridge Page (`/python-bridge`)

*   **Purpose:** This page serves two main functions:
    1.  Connecting to a live Python backend (quantum simulators, QPUs, or other data sources) that streams quantum data via WebSockets.
    2.  Testing and demoing the `QuantumSynestheticViz` component with sample QPIXL data without needing an active Python backend.
*   **Accessing:** Navigate to `/python-bridge` in your browser.

#### Key Features & Usage:
*   **WebSocket Port:** Input field to specify the port your Python WebSocket server is running on (default: 8765). The visualizer will attempt to connect if a valid port is entered.
*   **"Test QPIXL Mode" Button:**
    *   Click this to inject a predefined sample dataset directly into the `QuantumSynestheticViz` component.
    *   This sample data includes both `probabilities` (to trigger the QPIXL visualization mode) and a `qpixlData` (Float32Array for the grid visuals).
    *   Useful for instantly seeing the QPIXL visualizer in action and for demos.
*   **"Reset Test" Button:** Appears when Test Mode is active. Click to clear the injected test data and revert the visualizer to listening for WebSocket data (if a port is configured).
*   **"Show Debug" / "Hide Debug" Button:** Toggles a panel that displays the last received WebSocket message or the currently injected test data, allowing you to inspect the data structure.
*   **"Show Code" / "Hide Code" Button:** Toggles a panel displaying an example Python script (`qpixl_synesthetic_bridge.py`) that demonstrates how to send correctly formatted data to the visualizer.
*   **Instructions & Data Format Panel:** The bottom panel provides:
    *   Example Python commands to start a demo server.
    *   The expected JSON data structure for `quantum_state_update` messages, including `probabilities` and `qpixlData`.
    *   Basic troubleshooting tips for this page.

## 🧩 Key Architectural Components

Understanding the core components can be helpful for developers or those curious about the inner workings:

*   **`src/components/VisualAnalyzer.tsx`**: This is the heart of the visual output. It's a versatile React component that uses the HTML5 Canvas API to render all different visualization modes (Waveform, Frequency, Quantum Simulation, and the detailed QPIXL Grid). It receives data and configuration as props and handles the direct drawing logic.
*   **`src/components/QuantumSynestheticViz.tsx`**: This component acts as a specialized wrapper, primarily for the `/python-bridge` page. It encapsulates `VisualAnalyzer` and adds functionality for WebSocket connections to receive external quantum data (like QPIXL streams from a Python backend). It also manages its own state for external data injection and testing.
*   **`src/lib/quantumAudioEngine.ts`**: The powerhouse for sound generation. This class is responsible for all audio synthesis, including interpreting quantum settings, generating various waveforms, applying effects, and crucially, creating the QPIXL `Float32Array` data that can be used by both the audio engine (to modulate sound) and the `VisualAnalyzer` (for QPIXL grid display).
*   **`src/pages/Index.tsx`**: The main application page that constructs the DAW-like user interface. It integrates and manages the state for most of the control components, the `VisualAnalyzer`, and the `quantumAudioEngine`.
*   **`src/pages/PythonBridge.tsx`**: Interface for testing with external Python data or internal test QPIXL data. It uses `QuantumSynestheticViz` to display the results.
*   **`src/components/Walkthrough.tsx`**: The interactive, step-by-step user guide component. It's designed to be easily integrated and provides contextual help and highlighting for different UI elements on the `Index.tsx` page.

## 💡 Basic Troubleshooting

Encountering issues? Here are a few common scenarios and tips:

*   **Visualizer is Blank or Not Showing Expected QPIXL Data:**
    *   **On the Main DAW Page (`/`):**
        *   Ensure "QPIXL Integration" is switched ON in the QPIXL Settings panel.
        *   Press the main **Play** button in the DAW Transport to generate audio and QPIXL data.
        *   Check the "QPIXL Status Indicator" below the visualizer type selectors for messages like "No Data" or "Integration Disabled."
    *   **On the Python Bridge Page (`/python-bridge`):**
        *   Use "Test QPIXL Mode" first. Click the button and see if the visualizer updates. Check the Debug Panel to confirm test data (including `probabilities` and `qpixlData`) was injected.
        *   If using WebSockets:
            *   Verify your Python server is running and sending data to the correct WebSocket port (default: 8765).
            *   Ensure the port number in the UI matches your Python server's port.
            *   Check the Debug Panel on the `/python-bridge` page for incoming messages and their structure. The data must include a `probabilities` object to activate QPIXL mode in `QuantumSynestheticViz` and ideally a `qpixlData` (Float32Array) for the grid.
*   **No Audio Output:**
    *   Check the Master Volume slider (in the Advanced Synthesis accordion on the main page, then within its "Master Volume" item).
    *   Ensure you have interacted with the page (e.g., clicked a button) to allow the browser to initialize the AudioContext. This is a common browser security feature.
    *   Look for any error messages in your browser's developer console (usually F12).
*   **Walkthrough Highlighting Seems Off or Not Working:**
    *   The CSS class selectors defined in `Walkthrough.tsx` for highlighting specific elements must exactly match the class names applied to those elements in `Index.tsx`. If the layout or class names in `Index.tsx` change, the `highlight` selectors in `Walkthrough.tsx` might need updating.
*   **General UI Issues or Unexpected Behavior:**
    *   Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to clear any cached assets.
    *   Open your browser's developer console to check for any error messages.

*(This README aims to be comprehensive. Further details on specific quantum algorithms or advanced audio theory are beyond its scope but can be found in relevant research papers or documentation for the underlying quantum simulation tools if applicable.)*
