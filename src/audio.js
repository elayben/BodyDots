let audioCtx   = null;
let oscillator = null;
let gainNode   = null;
let active     = false;

const WAVE_TYPES = ['sine', 'triangle', 'square', 'sawtooth'];
const NOTES      = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function freqToNote(freq) {
  const semitones = 12 * Math.log2(freq / 261.63);
  const idx = ((Math.round(semitones) % 12) + 12) % 12;
  return NOTES[idx];
}

export function initAudio() {
  audioCtx   = new AudioContext();
  gainNode   = audioCtx.createGain();
  oscillator = audioCtx.createOscillator();

  oscillator.type = 'sine';
  oscillator.frequency.value = 440;
  gainNode.gain.value = 0;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();
}

export function updateAudio(leftWrist, rightWrist) {
  if (!active || !oscillator) return null;

  // Left wrist Y → pitch  (y=0 = top = high pitch)
  const pitchT = Math.max(0, Math.min(1, 1 - (leftWrist?.y ?? 0.5)));
  const freq   = 80 * Math.pow(1200 / 80, pitchT);
  oscillator.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.04);

  // Right wrist Y → volume  (hand up = louder)
  const vol = Math.max(0, Math.min(0.5, 1 - (rightWrist?.y ?? 0.8)));
  gainNode.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.04);

  // Right wrist X → waveform zone (4 horizontal bands)
  const zone     = Math.min(3, Math.floor((rightWrist?.x ?? 0) * 4));
  const waveType = WAVE_TYPES[zone];
  if (oscillator.type !== waveType) oscillator.type = waveType;

  return { note: freqToNote(freq), freq: Math.round(freq), waveform: waveType };
}

export function setAudioActive(val) {
  active = val;
  if (gainNode && !val) {
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.08);
  }
}

export function isAudioReady() {
  return audioCtx !== null;
}
