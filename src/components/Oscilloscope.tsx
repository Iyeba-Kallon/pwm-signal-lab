import { useEffect, useRef, useState } from 'react';
import { drawGrid, drawWaveform, drawDeadZones } from '../utils/waveform';
import type { PWMEngineState } from '../hooks/usePWMEngine';

interface OscilloscopeProps {
  state: PWMEngineState;
  generateWaveformPoints: any;
}

export default function Oscilloscope({ state, generateWaveformPoints }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const timeOffsetRef = useRef(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());
  const [cyclesVisible, setCyclesVisible] = useState(3);

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const render = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = time;

      if (state.isPlaying) {
        timeOffsetRef.current += dt;
      }

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw Oscilloscope background
      ctx.fillStyle = '#020617'; // slate-950 (darker screen)
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // 1. Draw Grid
      drawGrid(ctx, dimensions.width, dimensions.height, state.frequency, 5, cyclesVisible);

      // 2. Generate points based on current time
      const { pointsA, pointsB, deadZones } = generateWaveformPoints(
        dimensions.width,
        dimensions.height,
        cyclesVisible,
        timeOffsetRef.current
      );

      // 3. Draw Dead Zones
      if (state.isComplementary) {
        drawDeadZones(ctx, deadZones, dimensions.height, 'rgba(239, 68, 68, 0.35)');
      }

      // 4. Draw Waveforms
      drawWaveform(ctx, pointsA, '#3b82f6', 3); // blue-500
      
      if (state.isComplementary) {
        drawWaveform(ctx, pointsB, '#f59e0b', 3); // amber-500
      }

      animationRef.current = requestAnimationFrame(render);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, state, generateWaveformPoints, cyclesVisible]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] bg-slate-900 border border-slate-700 rounded-lg overflow-hidden relative">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {/* Cycles Visible Control */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 p-2 rounded-md border border-slate-700 backdrop-blur-sm z-10">
        <label className="text-xs text-slate-300 font-medium">Cycles:</label>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={cyclesVisible} 
          onChange={(e) => setCyclesVisible(parseInt(e.target.value))}
          className="w-20 accent-blue-500"
        />
        <span className="text-xs text-slate-300 w-4 text-center">{cyclesVisible}</span>
      </div>

      {/* Edge Case Warnings Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
        {state.frequency > 20000 && (
          <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded text-xs font-semibold border border-amber-500/50 backdrop-blur-sm">
            Ultrasonic range — above human hearing threshold
          </div>
        )}
        {state.isComplementary && state.deadTime > (1 / state.frequency) * 1e6 * Math.min(state.dutyCycle/100, 1 - state.dutyCycle/100) && (
          <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-xs font-semibold border border-red-500/50 backdrop-blur-sm">
            Dead time exceeds pulse width — signal overlap
          </div>
        )}
      </div>
    </div>
  );
}
