const loader        = document.getElementById("loader");
const loaderStatus  = document.getElementById("loader-status");
const app           = document.getElementById("app");
const fpsEl         = document.getElementById("fps-counter");
const badgeEl       = document.getElementById("tracking-badge");
const countEl       = document.getElementById("landmark-count");

// ── Loader ────────────────────────────────────────────────────────────────────
export function setLoaderStatus(msg) {
  loaderStatus.textContent = msg;
}

export function showApp() {
  app.classList.remove("hidden");
  loader.classList.add("fade-out");
  setTimeout(() => loader.remove(), 700);
}

export function showError(msg) {
  loaderStatus.textContent = "Error: " + msg;
  loaderStatus.style.color = "#f87171";
}

// ── HUD ───────────────────────────────────────────────────────────────────────
let tracking = false;

export function updateTracking(hasBody, landmarkTotal) {
  if (hasBody !== tracking) {
    tracking = hasBody;
    if (hasBody) {
      badgeEl.textContent = "TRACKING";
      badgeEl.className   = "badge badge--tracking";
    } else {
      badgeEl.textContent = "NO BODY";
      badgeEl.className   = "badge badge--idle";
    }
  }
  countEl.textContent = hasBody ? `${landmarkTotal} landmarks` : "0 landmarks";
}

// ── FPS counter ───────────────────────────────────────────────────────────────
let lastTime   = performance.now();
let frameCount = 0;

export function tickFps(now) {
  frameCount++;
  const delta = now - lastTime;
  if (delta >= 500) {
    const fps = Math.round(frameCount / (delta / 1000));
    fpsEl.textContent = `${fps} fps`;
    frameCount = 0;
    lastTime   = now;
  }
}
