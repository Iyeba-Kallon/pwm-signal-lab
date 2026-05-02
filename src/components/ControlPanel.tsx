import React from 'react';
import type { PWMEngineState } from '../hooks/usePWMEngine';

interface ControlPanelProps {
  state: PWMEngineState;
  updateState: (updates: Partial<PWMEngineState>) => void;
}

export default function ControlPanel({ state, updateState }: ControlPanelProps) {
  // Freq is log scale: slider goes from 0 to 5 (10^0 to 10^5 = 1Hz to 100kHz)
  const logFreq = Math.log10(state.frequency);

  const handleFreqSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateState({ frequency: Math.pow(10, val) });
  };

  const handleFreqNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      val = Math.max(1, Math.min(100000, val));
      updateState({ frequency: val });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
      <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">Controls</h2>
      
      {/* Frequency */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300">Frequency (Hz)</label>
          <input
            type="number"
            min="1"
            max="100000"
            value={Math.round(state.frequency)}
            onChange={handleFreqNumber}
            className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-200"
          />
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.01"
          value={logFreq}
          onChange={handleFreqSlider}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>1 Hz</span>
          <span>100 kHz</span>
        </div>
      </div>

      {/* Duty Cycle */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300">Duty Cycle (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={state.dutyCycle}
            onChange={(e) => updateState({ dutyCycle: parseFloat(e.target.value) || 0 })}
            className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-200"
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={state.dutyCycle}
          onChange={(e) => updateState({ dutyCycle: parseFloat(e.target.value) })}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Phase Offset */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300">Phase Offset (°)</label>
          <input
            type="number"
            min="0"
            max="360"
            value={state.phaseOffset}
            onChange={(e) => updateState({ phaseOffset: parseFloat(e.target.value) || 0 })}
            className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-200"
          />
        </div>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={state.phaseOffset}
          onChange={(e) => updateState({ phaseOffset: parseFloat(e.target.value) })}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Dead Time (Conditional) */}
      <div className={`flex flex-col gap-2 transition-opacity duration-300 ${state.isComplementary ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300">Dead Time (µs)</label>
          <input
            type="number"
            min="0"
            max="500"
            step="0.1"
            value={state.deadTime}
            onChange={(e) => updateState({ deadTime: parseFloat(e.target.value) || 0 })}
            className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-200"
          />
        </div>
        <input
          type="range"
          min="0"
          max="500"
          step="1"
          value={state.deadTime}
          onChange={(e) => updateState({ deadTime: parseFloat(e.target.value) })}
          className="w-full accent-amber-500"
        />
      </div>
      
      {/* Amplitude */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300">Amplitude (V)</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={state.amplitude}
            onChange={(e) => updateState({ amplitude: parseFloat(e.target.value) || 0 })}
            className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-200"
          />
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={state.amplitude}
          onChange={(e) => updateState({ amplitude: parseFloat(e.target.value) })}
          className="w-full accent-blue-500"
        />
      </div>

    </div>
  );
}
