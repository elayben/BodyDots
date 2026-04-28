const LOCK_MS  = 2200;
const WAVE_FRAMES = 30;

let lastGestureAt = 0;
const waveXHistory = [];

function tpose(pts) {
  const ls = pts[11], rs = pts[12], lw = pts[15], rw = pts[16];
  if (!ls || !rs || !lw || !rw) return false;
  const shoulderY = (ls.y + rs.y) / 2;
  return (
    Math.abs(lw.y - shoulderY) < 0.1 &&
    Math.abs(rw.y - shoulderY) < 0.1 &&
    lw.x < ls.x - 0.1 &&
    rw.x > rs.x + 0.1
  );
}

function armsUp(pts) {
  const nose = pts[0], lw = pts[15], rw = pts[16];
  if (!nose || !lw || !rw) return false;
  return lw.y < nose.y && rw.y < nose.y;
}

function wave(pts) {
  const lw = pts[15];
  if (!lw || (lw.visibility ?? 1) < 0.5) return false;
  waveXHistory.push(lw.x);
  if (waveXHistory.length > WAVE_FRAMES) waveXHistory.shift();
  if (waveXHistory.length < WAVE_FRAMES) return false;
  // count direction reversals
  let crossings = 0, prevDir = 0;
  for (let i = 1; i < waveXHistory.length; i++) {
    const d = waveXHistory[i] - waveXHistory[i - 1];
    const dir = d > 0.012 ? 1 : d < -0.012 ? -1 : 0;
    if (dir && prevDir && dir !== prevDir) crossings++;
    if (dir) prevDir = dir;
  }
  return crossings >= 4;
}

export function detectGesture(landmarks) {
  if (!landmarks?.length) return null;
  const pts = landmarks[0];
  const now = Date.now();
  if (now - lastGestureAt < LOCK_MS) return null;

  let name = null;
  if (armsUp(pts))    name = 'HANDS UP!';
  else if (tpose(pts)) name = 'T-POSE';
  else if (wave(pts))  name = 'WAVE 👋';

  if (name) lastGestureAt = now;
  return name;
}
