import { THEMES } from './themes.js';

let themeIndex = 0;

export function initDock({ onThemeChange, onTrailsToggle, onPaintToggle, onThereminToggle, onClear }) {
  const btnTheme  = document.getElementById('btn-theme');
  const themeLabel = document.getElementById('theme-label');
  const btnTrails = document.getElementById('btn-trails');
  const btnPaint  = document.getElementById('btn-paint');
  const btnAudio  = document.getElementById('btn-audio');
  const btnClear  = document.getElementById('btn-clear');

  btnClear.style.display = 'none';

  btnTheme.addEventListener('click', () => {
    themeIndex = (themeIndex + 1) % THEMES.length;
    const theme = THEMES[themeIndex];
    themeLabel.textContent = theme.name;
    onThemeChange?.(theme.id);
  });

  btnTrails.addEventListener('click', () => {
    const on = btnTrails.classList.toggle('dock-btn--active');
    onTrailsToggle?.(on);
  });

  btnPaint.addEventListener('click', () => {
    const on = btnPaint.classList.toggle('dock-btn--active');
    btnClear.style.display = on ? 'flex' : 'none';
    onPaintToggle?.(on);
  });

  btnAudio.addEventListener('click', () => {
    const on = btnAudio.classList.toggle('dock-btn--active');
    onThereminToggle?.(on);
  });

  btnClear.addEventListener('click', () => onClear?.());
}

export function showGesture(name) {
  const toast = document.getElementById('gesture-toast');
  if (!toast) return;
  toast.textContent = name;
  toast.classList.add('visible');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('visible'), 1800);
}
