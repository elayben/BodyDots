import { drawTrails } from './trails.js';

// Default region colors (used as paint fallback / legacy export)
export const REGION_COLORS = [
  ...Array(11).fill('#22d3ee'),
  ...Array(12).fill('#f472b6'),
  ...Array(10).fill('#a78bfa'),
];

export const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],[9,10],
  [11,12],[11,23],[12,24],[23,24],
  [11,13],[13,15],[15,17],[15,19],[15,21],[17,19],
  [12,14],[14,16],[16,18],[16,20],[16,22],[18,20],
  [23,25],[25,27],[27,29],[27,31],[29,31],
  [24,26],[26,28],[28,30],[28,32],[30,32],
];

function hexToRgb(hex) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

function drawSkeleton(ctx, pts, W, H, theme) {
  ctx.lineCap = 'round';
  for (const [a, b] of CONNECTIONS) {
    const pa = pts[a], pb = pts[b];
    if (!pa || !pb) continue;
    const vis = Math.min(pa.visibility ?? 1, pb.visibility ?? 1);
    if (vis < 0.25) continue;

    let strokeStyle;
    if (theme.skeletonColor) {
      strokeStyle = theme.skeletonColor;
    } else {
      const ca = theme.dotColor(a), cb = theme.dotColor(b);
      const grad = ctx.createLinearGradient(pa.x*W, pa.y*H, pb.x*W, pb.y*H);
      grad.addColorStop(0, `rgba(${hexToRgb(ca)},${vis * theme.skeletonOpacity})`);
      grad.addColorStop(1, `rgba(${hexToRgb(cb)},${vis * theme.skeletonOpacity})`);
      strokeStyle = grad;
    }

    ctx.shadowBlur  = theme.skeletonBlur;
    ctx.shadowColor = theme.dotColor(a);
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth   = theme.skeletonWidth ?? 2;
    ctx.beginPath();
    ctx.moveTo(pa.x * W, pa.y * H);
    ctx.lineTo(pb.x * W, pb.y * H);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawDots(ctx, pts, W, H, theme, timestamp) {
  if (!theme.showDots) return;
  const t = timestamp * 0.001;

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (!p) continue;
    const vis = p.visibility ?? 1;
    if (vis < 0.25) continue;

    const color = theme.dotColor(i);
    const rgb   = hexToRgb(color);
    const x = p.x * W, y = p.y * H;
    const r = theme.pulse
      ? theme.dotRadius * (1 + 0.18 * Math.sin(t * 1.8 + i * 0.22))
      : theme.dotRadius;

    // outer halo
    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
    halo.addColorStop(0, `rgba(${rgb},${vis * 0.22})`);
    halo.addColorStop(1, `rgba(${rgb},0)`);
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();

    // glow ring
    ctx.shadowBlur  = theme.glowBlur;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},${vis * 0.5})`;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // solid dot
    ctx.shadowBlur  = theme.glowBlur * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},${vis})`;
    ctx.fill();

    // specular
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${vis * 0.75})`;
    ctx.fill();

    // Fire theme: upward sparks
    if (theme.id === 'fire' && vis > 0.5) {
      for (let s = 0; s < 3; s++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.0;
        const dist  = r * 1.5 + Math.random() * r * 3;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${Math.floor(Math.random() * 160)},0,${Math.random() * 0.55})`;
        ctx.fill();
      }
    }
  }
  ctx.shadowBlur = 0;
}

function drawThereminOverlay(ctx, pts, W, H, info) {
  const lw = pts[15];
  if (!lw || (lw.visibility ?? 0) < 0.3) return;
  const x = lw.x * W, y = lw.y * H - 32;
  ctx.font        = 'bold 12px Space Mono, monospace';
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fbbf24';
  ctx.shadowBlur  = 8;
  ctx.shadowColor = '#fbbf24';
  ctx.fillText(`♪ ${info.note}  ${info.freq}Hz`, x, y);
  ctx.shadowBlur = 0;
  ctx.textAlign  = 'left';
}

export function drawFrame(ctx, canvas, landmarks, timestamp, { theme, trailsActive, thereminInfo }) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;

  if (theme.onFrameStart) theme.onFrameStart(ctx, W, H);
  if (!landmarks?.length) return;

  const pts = landmarks[0];
  if (trailsActive) drawTrails(ctx, W, H, theme);
  drawSkeleton(ctx, pts, W, H, theme);
  drawDots(ctx, pts, W, H, theme, timestamp);
  if (thereminInfo?.note) drawThereminOverlay(ctx, pts, W, H, thereminInfo);
}
