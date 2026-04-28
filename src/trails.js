const TRAIL_LEN = 20;
const N = 33;

// Per-landmark position history (newest at end)
const trails = Array.from({ length: N }, () => []);

function hexToRgb(hex) {
  return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`;
}

export function pushTrailPositions(landmarks) {
  if (!landmarks?.length) return;
  const pts = landmarks[0];
  for (let i = 0; i < Math.min(pts.length, N); i++) {
    const p = pts[i];
    if (!p || (p.visibility ?? 1) < 0.3) continue;
    trails[i].push({ x: p.x, y: p.y });
    if (trails[i].length > TRAIL_LEN) trails[i].shift();
  }
}

export function drawTrails(ctx, W, H, theme) {
  ctx.lineCap = 'round';
  for (let i = 0; i < N; i++) {
    const trail = trails[i];
    if (trail.length < 2) continue;
    const rgb = hexToRgb(theme.dotColor(i));
    for (let j = 0; j < trail.length - 1; j++) {
      const opacity = (j / trail.length) * 0.45;
      const width   = Math.max(0.5, (j / trail.length) * theme.dotRadius * 0.8);
      ctx.beginPath();
      ctx.moveTo(trail[j].x * W, trail[j].y * H);
      ctx.lineTo(trail[j + 1].x * W, trail[j + 1].y * H);
      ctx.strokeStyle = `rgba(${rgb},${opacity})`;
      ctx.lineWidth   = width;
      ctx.stroke();
    }
  }
}

export function clearTrails() {
  for (let i = 0; i < N; i++) trails[i] = [];
}
