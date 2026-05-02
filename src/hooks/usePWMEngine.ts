import { useState, useCallback, useMemo } from 'react';
import { Point, DeadZoneRect } from '../utils/waveform';

export interface PWMEngineState {
  frequency: number; // Hz
  dutyCycle: number; // 0-100
  deadTime: number; // us
  amplitude: number; // V
  phaseOffset: number; // degrees
  isComplementary: boolean;
  isPlaying: boolean;
}

export function usePWMEngine() {
  const [state, setState] = useState<PWMEngineState>({
    frequency: 1000,
    dutyCycle: 50,
    deadTime: 0,
    amplitude: 5,
    phaseOffset: 0,
    isComplementary: false,
    isPlaying: true,
  });

  const updateState = (updates: Partial<PWMEngineState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Compute metrics
  const period = 1 / state.frequency; // seconds
  const periodUs = period * 1e6; // microseconds
  const tOnUs = (state.dutyCycle / 100) * periodUs;
  const tOffUs = periodUs - tOnUs;

  // Dead time logic (only applied in complementary mode)
  const activeDeadTimeUs = state.isComplementary ? state.deadTime : 0;

  // Effective metrics after dead time insertion
  // Dead time cuts into both the high and low times to create a gap between PWM_A and PWM_B
  const effectiveTOnUs = Math.max(0, tOnUs - activeDeadTimeUs);
  const effectiveDutyCycle = (effectiveTOnUs / periodUs) * 100;
  const vAvg = (effectiveDutyCycle / 100) * state.amplitude;

  // Generate waveform points and dead zones for the canvas
  const generateWaveformPoints = useCallback(
    (
      canvasWidth: number,
      canvasHeight: number,
      cyclesVisible: number,
      timeOffsetS: number
    ) => {
      const { frequency, amplitude, dutyCycle, phaseOffset, isComplementary } = state;
      const periodS = 1 / frequency;
      const totalTimeS = periodS * cyclesVisible;

      const phaseShiftS = (phaseOffset / 360) * periodS;
      const effectiveTimeOffsetS = timeOffsetS + phaseShiftS;

      const pointsA: Point[] = [];
      const pointsB: Point[] = [];
      const deadZones: DeadZoneRect[] = [];

      // We need high resolution to show vertical edges sharply, so we use a point per pixel.
      // However, to keep it crisp, we can just compute the exact transition points.
      // But for simplicity of scrolling, evaluating per X pixel is robust.
      
      const duty = dutyCycle / 100;
      const tOnS = duty * periodS;
      
      const deadTimeS = isComplementary ? state.deadTime * 1e-6 : 0;

      for (let x = 0; x <= canvasWidth; x++) {
        // Calculate the actual time at this pixel
        const t = (x / canvasWidth) * totalTimeS + effectiveTimeOffsetS;
        
        // Find position within the current cycle
        const cycleTime = t % periodS;
        
        // PWM A is HIGH during [0, tOnS - deadTimeS] theoretically,
        // Wait, dead time means both are LOW. 
        // Standard complementary with dead time:
        // A turns ON at t=deadTimeS, turns OFF at t=tOnS
        // B turns ON at t=tOnS+deadTimeS, turns OFF at t=periodS
        
        let valA = 0;
        let valB = 0;
        let isDeadZone = false;

        if (cycleTime >= 0 && cycleTime < deadTimeS) {
            // Rising edge dead time
            isDeadZone = true;
        } else if (cycleTime >= deadTimeS && cycleTime < tOnS) {
            // A is HIGH
            valA = amplitude;
        } else if (cycleTime >= tOnS && cycleTime < tOnS + deadTimeS) {
            // Falling edge dead time
            isDeadZone = true;
        } else if (cycleTime >= tOnS + deadTimeS && cycleTime < periodS) {
            // B is HIGH
            valB = amplitude;
        }

        // Map voltage to Y pixel (invert Y because canvas 0 is top)
        // Leave a small margin (10% of height) top and bottom
        const marginY = canvasHeight * 0.1;
        const availableHeight = canvasHeight - 2 * marginY;
        
        // Max voltage is 5V, so map 0-5V to available height
        const mapY = (v: number) => canvasHeight - marginY - (v / 5) * availableHeight;

        pointsA.push({ x, y: mapY(valA) });
        if (isComplementary) {
          pointsB.push({ x, y: mapY(valB) });
          if (isDeadZone) {
            // Record dead zone pixel ranges
            // We can just add a 1px width rect for each dead zone pixel
            deadZones.push({ x, width: 1 });
          }
        }
      }

      // Optimize dead zones: merge adjacent 1px rects
      const mergedDeadZones: DeadZoneRect[] = [];
      if (deadZones.length > 0) {
        let current = { ...deadZones[0] };
        for (let i = 1; i < deadZones.length; i++) {
          if (deadZones[i].x === current.x + current.width) {
            current.width += 1;
          } else {
            mergedDeadZones.push(current);
            current = { ...deadZones[i] };
          }
        }
        mergedDeadZones.push(current);
      }

      return { pointsA, pointsB, deadZones: mergedDeadZones };
    },
    [state]
  );

  return {
    state,
    updateState,
    metrics: {
      periodUs,
      tOnUs,
      tOffUs,
      activeDeadTimeUs,
      effectiveDutyCycle,
      vAvg,
    },
    generateWaveformPoints,
  };
}
