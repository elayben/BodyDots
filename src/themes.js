// Lazily initialized per-theme state
let _stars = null;

function getStars() {
  if (!_stars) {
    _stars = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      o: Math.random() * 0.4 + 0.15,
    }));
  }
  return _stars;
}

export const THEMES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    showDots: true,
    pulse: true,
    dotRadius: 6,
    glowBlur: 18,
    skeletonOpacity: 0.55,
    skeletonBlur: 10,
    skeletonWidth: 2,
    dotColor: (i) => (i <= 10 ? '#22d3ee' : i <= 22 ? '#f472b6' : '#a78bfa'),
    skeletonColor: null, // null = gradient between endpoint colors
    onFrameStart: null,
  },
  {
    id: 'constellation',
    name: 'Constellation',
    showDots: true,
    pulse: false,
    dotRadius: 3.5,
    glowBlur: 6,
    skeletonOpacity: 0.25,
    skeletonBlur: 3,
    skeletonWidth: 1,
    dotColor: () => '#e2e8f0',
    skeletonColor: 'rgba(226,232,240,0.25)',
    onFrameStart: (ctx, W, H) => {
      for (const s of getStars()) {
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.o})`;
        ctx.fill();
      }
    },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    showDots: true,
    pulse: true,
    dotRadius: 5,
    glowBlur: 16,
    skeletonOpacity: 0.7,
    skeletonBlur: 10,
    skeletonWidth: 1.5,
    dotColor: () => '#00ff41',
    skeletonColor: 'rgba(0,255,65,0.7)',
    onFrameStart: null,
  },
  {
    id: 'fire',
    name: 'Fire',
    showDots: true,
    pulse: true,
    dotRadius: 7,
    glowBlur: 24,
    skeletonOpacity: 0.6,
    skeletonBlur: 14,
    skeletonWidth: 2.5,
    dotColor: (i) => ['#ff4500', '#ff6a00', '#ff8c00', '#ffb700', '#ffd700'][i % 5],
    skeletonColor: null,
    onFrameStart: null,
  },
  {
    id: 'wireframe',
    name: 'Wireframe',
    showDots: false,
    pulse: false,
    dotRadius: 2,
    glowBlur: 0,
    skeletonOpacity: 0.9,
    skeletonBlur: 0,
    skeletonWidth: 1.5,
    dotColor: () => '#ffffff',
    skeletonColor: 'rgba(255,255,255,0.9)',
    onFrameStart: null,
  },
];

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function resetThemeState() {
  _stars = null;
}
