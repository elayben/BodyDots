import { initTracker, startCamera }                          from './tracker.js';
import { drawFrame }                                          from './renderer.js';
import { setLoaderStatus, showApp, showError, updateTracking, tickFps } from './ui.js';
import { getTheme, resetThemeState }                          from './themes.js';
import { pushTrailPositions, drawTrails, clearTrails }        from './trails.js';
import { initPaint, paintFrame, clearPaint, setPaintActive, syncPaintSize } from './paint.js';
import { initAudio, updateAudio, setAudioActive, isAudioReady } from './audio.js';
import { detectGesture }                                      from './gestures.js';
import { initDock, showGesture }                              from './dock.js';

const video       = document.getElementById('video');
const canvas      = document.getElementById('canvas');
const paintCanvas = document.getElementById('paint-canvas');
const ctx         = canvas.getContext('2d');

const state = {
  theme:          getTheme('cyberpunk'),
  trailsActive:   false,
  thereminActive: false,
  thereminInfo:   null,
};

function syncCanvasSize() {
  const W = video.videoWidth  || video.clientWidth;
  const H = video.videoHeight || video.clientHeight;
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width  = W;
    canvas.height = H;
  }
}

async function main() {
  try {
    const tracker = await initTracker(setLoaderStatus);
    const stream  = await startCamera(setLoaderStatus);

    video.srcObject = stream;
    await new Promise((r) => (video.onloadedmetadata = r));

    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);

    initPaint(paintCanvas);

    initDock({
      onThemeChange: (id) => {
        resetThemeState();
        clearTrails();
        state.theme = getTheme(id);
      },
      onTrailsToggle: (on) => {
        state.trailsActive = on;
        if (!on) clearTrails();
      },
      onPaintToggle: (on) => setPaintActive(on),
      onThereminToggle: (on) => {
        state.thereminActive = on;
        if (!isAudioReady()) initAudio();
        setAudioActive(on);
        if (!on) state.thereminInfo = null;
      },
      onClear: () => clearPaint(),
    });

    showApp();

    let lastTs = -1;

    function loop() {
      const now = performance.now();
      tickFps(now);

      if (now !== lastTs) {
        syncCanvasSize();
        syncPaintSize(canvas.width, canvas.height);

        const result  = tracker.detect(video, now);
        const hasBody = result.landmarks?.length > 0;
        const pts     = hasBody ? result.landmarks[0] : null;

        updateTracking(hasBody, hasBody ? pts.length : 0);

        if (state.trailsActive)                pushTrailPositions(result.landmarks);
        if (hasBody)                           paintFrame(result.landmarks, state.theme);
        if (state.thereminActive && pts)       state.thereminInfo = updateAudio(pts[15], pts[16]);

        const gesture = detectGesture(result.landmarks);
        if (gesture) showGesture(gesture);

        drawFrame(ctx, canvas, result.landmarks, now, {
          theme:        state.theme,
          trailsActive: state.trailsActive,
          thereminInfo: state.thereminActive ? state.thereminInfo : null,
        });

        lastTs = now;
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  } catch (err) {
    console.error(err);
    showError(err.message);
  }
}

main();
