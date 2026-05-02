import React, { useState } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import { usePWMEngine } from './hooks/usePWMEngine';
import ControlPanel from './components/ControlPanel';
import Oscilloscope from './components/Oscilloscope';
import SignalMetrics from './components/SignalMetrics';
import ComplementaryToggle from './components/ComplementaryToggle';

function App() {
  const { state, updateState, metrics, generateWaveformPoints } = usePWMEngine();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    // We can't directly get the current frame from this scope cleanly if it's continuously rendering,
    // but canvas.toDataURL works on the last rendered frame.
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pwm-waveform.png';
    a.click();
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'pwm-config.json';
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            P
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            PWM Signal Lab
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => updateState({ isPlaying: !state.isPlaying })}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              state.isPlaying 
                ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
            }`}
          >
            {state.isPlaying ? <Pause size={18} /> : <Play size={18} />}
            {state.isPlaying ? 'Freeze' : 'Play'}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            >
              <Download size={18} />
              Export
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-20">
                <button
                  onClick={handleExportPNG}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Export as PNG
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Export Parameters (JSON)
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col-reverse md:flex-row p-4 gap-6 overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-[340px] flex flex-col gap-4 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <ComplementaryToggle 
            isComplementary={state.isComplementary} 
            onChange={(val) => updateState({ isComplementary: val })} 
          />
          <ControlPanel state={state} updateState={updateState} />
          <SignalMetrics metrics={metrics} />
        </div>

        {/* Right Panel - Oscilloscope */}
        <div className="flex-1 flex flex-col min-h-[400px]">
          <Oscilloscope state={state} generateWaveformPoints={generateWaveformPoints} />
        </div>
      </main>
    </div>
  );
}

export default App;
