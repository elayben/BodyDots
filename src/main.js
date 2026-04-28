import { initTracker, startCamera } from "./tracker.js";
import { drawFrame } from "./renderer.js";
import { setLoaderStatus, showApp, showError, updateTracking, tickFps } from "./ui.js";

const video  = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx    = canvas.getContext("2d");

function syncCanvasSize() {
  canvas.width  = video.videoWidth  || video.clientWidth;
  canvas.height = video.videoHeight || video.clientHeight;
}

async function main() {
  try {
    const tracker = await initTracker(setLoaderStatus);
    const stream  = await startCamera(setLoaderStatus);

    video.srcObject = stream;
    await new Promise((r) => (video.onloadedmetadata = r));

    syncCanvasSize();
    window.addEventListener("resize", syncCanvasSize);
    showApp();

    let lastTs = -1;

    function loop() {
      const now = performance.now();
      tickFps(now);

      if (now !== lastTs) {
        syncCanvasSize();
        const result  = tracker.detect(video, now);
        const hasBody = result.landmarks?.length > 0;
        updateTracking(hasBody, hasBody ? result.landmarks[0].length : 0);
        drawFrame(ctx, canvas, result.landmarks, now);
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
