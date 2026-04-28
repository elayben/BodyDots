let canvas = null;
let ctx    = null;
let active = false;

export function initPaint(paintCanvas) {
  canvas = paintCanvas;
  ctx    = canvas.getContext('2d');
}

export function syncPaintSize(W, H) {
  if (!canvas || (canvas.width === W && canvas.height === H)) return;
  canvas.width  = W;
  canvas.height = H;
}

export function paintFrame(landmarks, theme) {
  if (!active || !ctx || !landmarks?.length) return;
  const pts = landmarks[0];
  const W   = canvas.width;
  const H   = canvas.height;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (!p || (p.visibility ?? 1) < 0.4) continue;
    ctx.beginPath();
    ctx.arc(p.x * W, p.y * H, 4, 0, Math.PI * 2);
    ctx.fillStyle = theme.dotColor(i) + 'bb';
    ctx.fill();
  }
}

export function clearPaint() {
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function setPaintActive(val) {
  active = val;
}
