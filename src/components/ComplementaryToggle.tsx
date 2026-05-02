import React from 'react';

interface ComplementaryToggleProps {
  isComplementary: boolean;
  onChange: (val: boolean) => void;
}

export default function ComplementaryToggle({ isComplementary, onChange }: ComplementaryToggleProps) {
  return (
    <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-200">Output Mode</h3>
        <p className="text-xs text-slate-400 mt-1">
          {isComplementary 
            ? "Complementary (PWM A & B with dead time)" 
            : "Single Channel (PWM A only)"}
        </p>
      </div>
      <button
        onClick={() => onChange(!isComplementary)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          isComplementary ? 'bg-blue-500' : 'bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isComplementary ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
