import React from 'react';

interface SignalMetricsProps {
  metrics: {
    periodUs: number;
    tOnUs: number;
    tOffUs: number;
    activeDeadTimeUs: number;
    effectiveDutyCycle: number;
    vAvg: number;
  };
}

export default function SignalMetrics({ metrics }: SignalMetricsProps) {
  const formatTime = (us: number) => {
    if (us >= 1000) return `${(us / 1000).toFixed(2)} ms`;
    return `${us.toFixed(2)} µs`;
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mt-4">
      <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">Signal Metrics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Period (T)</div>
          <div className="text-lg font-mono text-blue-400">{formatTime(metrics.periodUs)}</div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">High Time (T_on)</div>
          <div className="text-lg font-mono text-emerald-400">{formatTime(metrics.tOnUs)}</div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Low Time (T_off)</div>
          <div className="text-lg font-mono text-slate-300">{formatTime(metrics.tOffUs)}</div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Dead Time</div>
          <div className="text-lg font-mono text-amber-400">{metrics.activeDeadTimeUs > 0 ? formatTime(metrics.activeDeadTimeUs) : 'Off'}</div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Eff. Duty Cycle</div>
          <div className="text-lg font-mono text-blue-400">{metrics.effectiveDutyCycle.toFixed(1)}%</div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Avg Voltage</div>
          <div className="text-lg font-mono text-purple-400">{metrics.vAvg.toFixed(2)} V</div>
        </div>
      </div>
    </div>
  );
}
