# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**BodyDots** — browser-based AR body tracking app. Uses MediaPipe Pose Landmarker (WASM/GPU) to detect 33 body landmarks via webcam and overlays colored dots + skeleton lines on the live video feed.

## Run Locally

Camera access requires a secure context (localhost or HTTPS). Serve with any static server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Architecture

```
index.html   # shell: <video> + <canvas> overlay + status bar
style.css    # full-screen layout; container mirrored (scaleX(-1)) for selfie feel
app.js       # all logic: MediaPipe init, camera setup, detection loop, drawing
```

### How It Works

1. `FilesetResolver.forVisionTasks(wasmCDN)` loads MediaPipe WASM runtime from CDN.
2. `PoseLandmarker.createFromOptions(...)` downloads the `pose_landmarker_full` model (~4 MB) from Google Storage and initialises on GPU.
3. `getUserMedia({ facingMode: "user" })` starts the webcam.
4. `requestAnimationFrame` loop calls `landmarker.detectForVideo(video, timestamp)` each frame.
5. Results contain `landmarks[0]` — 33 `{x, y, z, visibility}` points (normalized 0–1).
6. `drawLandmarks()` draws skeleton lines then color-coded dots on the `<canvas>`.

### Dot Colors
| Region | Indices | Color |
|--------|---------|-------|
| Face | 0–10 | Blue `#38bdf8` |
| Upper body | 11–22 | Yellow `#facc15` |
| Lower body | 23–32 | Green `#4ade80` |

### Key Knobs in `app.js`
- `dotColor(index)` — change landmark colors
- `CONNECTIONS` array — skeleton line pairs
- `minPoseDetectionConfidence` / `minTrackingConfidence` — tune detection sensitivity
- Dot radius: `7` px (in `ctx.arc` call)
- Model: swap `pose_landmarker_full` → `pose_landmarker_lite` for faster but less accurate tracking
