# BodyDots

> Browser-based AR body tracking — MediaPipe pose dots and skeleton lines overlaid on your live webcam feed, right in the browser.

---

## Features

- **Real-time pose tracking** — detects 33 body landmarks at full camera framerate using MediaPipe Pose Landmarker (GPU/WASM)
- **Color-coded skeleton** — face, upper body, and lower body dots are each a distinct color for at-a-glance clarity
- **Multiple themes** — cycle through visual themes (Cyberpunk, and more) from the on-screen dock
- **Motion trails** — enable ghosting trails that follow your body's movement
- **Paint mode** — use your body as a brush; your pose paints directly onto the canvas
- **Theremin** — move your hands to control pitch and volume of a synthesized tone
- **Gesture detection** — recognizes gestures and shows toast notifications
- **Live HUD** — real-time FPS counter and tracking status badge
- **Zero install** — runs entirely in the browser; no backend, no dependencies to install

---

## Demo

Open `index.html` over a local static server and allow camera access. That's it.

---

## Getting Started

Camera access requires a **secure context** (either `localhost` or `https://`). Serve the project with any static file server:

```bash
# Python 3
python3 -m http.server 8080
# then open http://localhost:8080
```

```bash
# Node.js (npx)
npx serve .
```

Allow the browser camera permission when prompted, and the app will load and start tracking automatically.

---

## Controls

| Button | Action |
|--------|--------|
| ◈ | Cycle through visual themes |
| 〰 | Toggle motion trails |
| ✦ | Toggle paint mode |
| ♪ | Toggle theremin (hand-controlled synth) |
| ✕ | Clear the paint canvas |

---

## How It Works

1. **MediaPipe WASM** is loaded from CDN via `FilesetResolver`.
2. **PoseLandmarker** downloads the `pose_landmarker_full` model (~4 MB) from Google Storage and initialises on the GPU.
3. **Webcam** is accessed via `getUserMedia({ facingMode: "user" })` and mirrored for a natural selfie view.
4. A **`requestAnimationFrame` loop** calls `landmarker.detectForVideo(video, timestamp)` every frame.
5. Results contain 33 `{x, y, z, visibility}` landmarks (normalized 0–1), which are drawn onto an HTML `<canvas>` layered over the live video.

### Landmark Color Scheme

| Region | Landmark Indices | Color |
|--------|-----------------|-------|
| Face | 0–10 | Blue `#38bdf8` |
| Upper body | 11–22 | Yellow `#facc15` |
| Lower body | 23–32 | Green `#4ade80` |

---

## Project Structure

```
BodyDots/
├── index.html          # App shell: <video> + <canvas> overlay + HUD + dock
├── css/
│   ├── base.css        # Global resets and variables
│   ├── loader.css      # Loading screen styles
│   ├── layout.css      # Full-screen layout; container mirrored (scaleX(-1))
│   └── dock.css        # Floating control dock styles
└── src/
    ├── main.js         # Entry point: wires everything together
    ├── tracker.js      # MediaPipe init, camera setup, detection loop
    ├── renderer.js     # Draws skeleton lines and color-coded dots
    ├── themes.js       # Theme definitions and cycling logic
    ├── trails.js       # Motion trail effect
    ├── paint.js        # Paint mode (body-as-brush)
    ├── audio.js        # Theremin synth (Web Audio API)
    ├── gestures.js     # Gesture recognition
    ├── dock.js         # Control dock button wiring
    └── ui.js           # HUD updates (FPS, badge, landmark count)
```

---

## Tech Stack

- **[MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker)** — on-device ML pose estimation
- **Web Audio API** — theremin synthesizer
- **HTML5 Canvas** — landmark rendering, paint mode, and trails
- **Vanilla JS (ES Modules)** — no framework, no bundler
- **CSS** — Space Grotesk & Space Mono fonts via Google Fonts

---

## License

MIT
