export interface Point {
  x: number;
  y: number;
}

export interface DeadZoneRect {
  x: number;
  width: number;
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frequency: number,
  amplitude: number,
  cyclesVisible: number
) {
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = '#334155'; // slate-700
  ctx.lineWidth = 1;

  ctx.beginPath();
  
  // Draw horizontal lines (voltage)
  const numVLines = 5;
  for (let i = 0; i <= numVLines; i++) {
    const y = (height / numVLines) * i;
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }

  // Draw vertical lines (time)
  const numHLines = cyclesVisible * 2;
  for (let i = 0; i <= numHLines; i++) {
    const x = (width / numHLines) * i;
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  
  ctx.stroke();
  
  // Labels
  ctx.fillStyle = '#cbd5e1'; // slate-300
  ctx.font = '12px monospace';
  ctx.textBaseline = 'bottom';
  
  // Y-axis labels
  for (let i = 0; i <= numVLines; i++) {
    const v = amplitude - (amplitude / numVLines) * i;
    const y = (height / numVLines) * i;
    // For the last line (0V), shift it up so it's not cut off by the canvas edge
    const labelY = i === numVLines ? y - 4 : Math.max(15, y + 14);
    ctx.fillText(`${v.toFixed(1)}V`, 5, labelY);
  }

  // X-axis label unit (ms or us)
  const periodS = 1 / frequency;
  const unit = periodS < 0.001 ? 'µs' : 'ms';
  const multiplier = periodS < 0.001 ? 1e6 : 1e3;
  
  const totalTime = periodS * cyclesVisible * multiplier;
  ctx.fillText(`Time (${unit}) -> total: ${totalTime.toFixed(1)}`, width - 150, height - 5);
}

export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  strokeWidth: number = 2
) {
  if (points.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = 'round';
  ctx.beginPath();

  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.stroke();
}

export function drawDeadZones(
  ctx: CanvasRenderingContext2D,
  deadZoneRects: DeadZoneRect[],
  height: number,
  color: string = 'rgba(239, 68, 68, 0.2)' // red-500 with 20% opacity
) {
  ctx.fillStyle = color;
  for (const rect of deadZoneRects) {
    ctx.fillRect(rect.x, 0, rect.width, height);
  }
}
