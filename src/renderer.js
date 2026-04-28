// Landmark colors by body region (33 MediaPipe landmarks)
export const REGION_COLORS = [
  // face (0-10)
  ...Array(11).fill("#22d3ee"),
  // upper body: shoulders, arms, hands (11-22)
  ...Array(12).fill("#f472b6"),
  // lower body: hips, legs, feet (23-32)
  ...Array(10).fill("#a78bfa"),
];

// Skeleton connection pairs (MediaPipe landmark indices)
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

function drawSkeleton(ctx, pts, W, H) {
  ctx.lineCap = "round";
  for (const [a, b] of CONNECTIONS) {
    const pa = pts[a], pb = pts[b];
    if (!pa || !pb) continue;
    const vis = Math.min(pa.visibility ?? 1, pb.visibility ?? 1);
    if (vis < 0.25) continue;

    const ca = REGION_COLORS[a];
    const cb = REGION_COLORS[b];
    const grad = ctx.createLinearGradient(pa.x*W, pa.y*H, pb.x*W, pb.y*H);
    grad.addColorStop(0, `rgba(${hexToRgb(ca)},${vis * 0.55})`);
    grad.addColorStop(1, `rgba(${hexToRgb(cb)},${vis * 0.55})`);

    ctx.shadowBlur  = 10;
    ctx.shadowColor = ca;
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(pa.x * W, pa.y * H);
    ctx.lineTo(pb.x * W, pb.y * H);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawDots(ctx, pts, W, H, timestamp) {
  const t = timestamp * 0.001;

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (!p) continue;
    const vis = p.visibility ?? 1;
    if (vis < 0.25) continue;

    const color = REGION_COLORS[i];
    const rgb   = hexToRgb(color);
    const x     = p.x * W;
    const y     = p.y * H;

    // each dot pulses slightly out of phase → wave effect
    const r = 6 * (1 + 0.18 * Math.sin(t * 1.8 + i * 0.22));

    // outer radial halo
    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
    halo.addColorStop(0, `rgba(${rgb},${vis * 0.25})`);
    halo.addColorStop(1, `rgba(${rgb},0)`);
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();

    // glowing outer ring
    ctx.shadowBlur  = 18;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},${vis * 0.5})`;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // solid dot
    ctx.shadowBlur  = 12;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},${vis})`;
    ctx.fill();

    // specular highlight
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${vis * 0.75})`;
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

export function drawFrame(ctx, canvas, landmarks, timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks?.length) return;

  const pts = landmarks[0];
  const W = canvas.width;
  const H = canvas.height;

  drawSkeleton(ctx, pts, W, H);
  drawDots(ctx, pts, W, H, timestamp);
}
